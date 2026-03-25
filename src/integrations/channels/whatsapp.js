/**
 * WhatsApp Channel Handler for OMNIGENT
 * Real integration using Twilio WhatsApp API or WhatsApp Business API
 */

import axios from 'axios';

class WhatsAppHandler {
  constructor(config = {}) {
    this.accountSid = config.accountSid || process.env.TWILIO_ACCOUNT_SID;
    this.authToken = config.authToken || process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = config.phoneNumber || process.env.TWILIO_WHATSAPP_NUMBER;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
    this.conversations = {};
    this.status = 'disconnected';
    this.auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
  }

  /**
   * Connect to WhatsApp API
   */
  async connect() {
    if (!this.accountSid || !this.authToken || !this.phoneNumber) {
      throw new Error('Twilio credentials required: accountSid, authToken, phoneNumber');
    }

    try {
      this.status = 'connecting';

      // Verify credentials by getting account info
      const response = await axios.get(`${this.baseUrl}`, {
        auth: {
          username: this.accountSid,
          password: this.authToken
        }
      });

      if (response.status === 200) {
        this.accountInfo = response.data;
        this.status = 'connected';
        return {
          success: true,
          accountSid: this.accountSid,
          phoneNumber: this.phoneNumber
        };
      }

      throw new Error('Failed to verify credentials');
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Disconnect from WhatsApp
   */
  async disconnect() {
    this.status = 'disconnected';
    this.conversations = {};
    return { success: true };
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(to, body, options = {}) {
    if (this.status !== 'connected') {
      throw new Error('WhatsApp handler not connected');
    }

    try {
      const url = `${this.baseUrl}/Messages.json`;

      const payload = new URLSearchParams({
        From: `whatsapp:${this.phoneNumber}`,
        To: `whatsapp:${to}`,
        Body: body,
        ...options.mediaUrl && { MediaUrl: options.mediaUrl }
      });

      const response = await axios.post(url, payload, {
        auth: {
          username: this.accountSid,
          password: this.authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.status === 201) {
        return {
          success: true,
          messageSid: response.data.sid,
          to,
          timestamp: new Date().toISOString()
        };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send media message (image, video, audio, document)
   */
  async sendMedia(to, mediaUrl, caption = '', mediaType = 'image') {
    try {
      const url = `${this.baseUrl}/Messages.json`;

      const payload = new URLSearchParams({
        From: `whatsapp:${this.phoneNumber}`,
        To: `whatsapp:${to}`,
        Body: caption,
        MediaUrl: mediaUrl
      });

      const response = await axios.post(url, payload, {
        auth: {
          username: this.accountSid,
          password: this.authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        success: response.status === 201,
        messageSid: response.data.sid,
        mediaType
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send message with template
   */
  async sendTemplate(to, templateName, parameters = []) {
    try {
      const url = `${this.baseUrl}/Messages.json`;

      const payload = new URLSearchParams({
        From: `whatsapp:${this.phoneNumber}`,
        To: `whatsapp:${to}`,
        ContentSid: templateName,
        ...parameters.length > 0 && {
          ContentVariables: JSON.stringify(parameters)
        }
      });

      const response = await axios.post(url, payload, {
        auth: {
          username: this.accountSid,
          password: this.authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        success: response.status === 201,
        messageSid: response.data.sid
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send button message
   */
  async sendButtonMessage(to, body, buttons) {
    // WhatsApp interactive messages with buttons
    try {
      const url = `${this.baseUrl}/Messages.json`;

      const interactiveData = {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.map(btn => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title
            }
          }))
        }
      };

      const payload = new URLSearchParams({
        From: `whatsapp:${this.phoneNumber}`,
        To: `whatsapp:${to}`,
        ContentType: 'application/json',
        Content: JSON.stringify(interactiveData)
      });

      const response = await axios.post(url, payload, {
        auth: {
          username: this.accountSid,
          password: this.authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        success: response.status === 201,
        messageSid: response.data.sid
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle incoming webhook event
   */
  async handleWebhookEvent(webhookData) {
    const { MessageSid, From, Body, NumMedia, MediaUrl0, MediaContentType0 } = webhookData;

    const fromNumber = From.replace('whatsapp:', '');

    // Add conversation
    if (!this.conversations[fromNumber]) {
      this.conversations[fromNumber] = {
        messages: [],
        startedAt: new Date().toISOString()
      };
    }

    const message = {
      messageSid: MessageSid,
      from: fromNumber,
      body: Body,
      hasMedia: NumMedia > 0,
      mediaUrl: MediaUrl0,
      mediaType: MediaContentType0,
      timestamp: new Date().toISOString()
    };

    this.conversations[fromNumber].messages.push(message);

    return {
      type: 'message',
      handled: true,
      ...message
    };
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid) {
    try {
      const url = `${this.baseUrl}/Messages/${messageSid}.json`;

      const response = await axios.get(url, {
        auth: {
          username: this.accountSid,
          password: this.authToken
        }
      });

      return {
        messageSid,
        status: response.data.status,
        to: response.data.to,
        from: response.data.from,
        body: response.data.body,
        dateSent: response.data.date_sent,
        dateUpdated: response.data.date_updated
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add conversation
   */
  addConversation(phoneNumber, name = '') {
    this.conversations[phoneNumber] = {
      name,
      messages: [],
      startedAt: new Date().toISOString(),
      lastMessage: null
    };
    return this.conversations[phoneNumber];
  }

  /**
   * Get all conversations
   */
  getConversations() {
    return Object.entries(this.conversations).map(([phoneNumber, conv]) => ({
      phoneNumber,
      ...conv,
      messageCount: conv.messages.length
    }));
  }

  /**
   * Mark conversation as archived
   */
  archiveConversation(phoneNumber) {
    if (this.conversations[phoneNumber]) {
      this.conversations[phoneNumber].archived = true;
      return true;
    }
    return false;
  }

  /**
   * Unarchive conversation
   */
  unarchiveConversation(phoneNumber) {
    if (this.conversations[phoneNumber]) {
      this.conversations[phoneNumber].archived = false;
      return true;
    }
    return false;
  }

  /**
   * Broadcast message to all conversations
   */
  async broadcast(body, options = {}) {
    const results = [];
    for (const phoneNumber of Object.keys(this.conversations)) {
      try {
        const result = await this.sendMessage(phoneNumber, body, options);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, phoneNumber });
      }
    }
    return results;
  }

  /**
   * Get handler status
   */
  getStatus() {
    return {
      platform: 'whatsapp',
      status: this.status,
      connected: this.status === 'connected',
      phoneNumber: this.phoneNumber,
      conversationCount: Object.keys(this.conversations).length,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Get conversation history
   */
  getConversationHistory(phoneNumber) {
    const conv = this.conversations[phoneNumber];
    if (!conv) return null;

    return {
      phoneNumber,
      ...conv
    };
  }
}

export default WhatsAppHandler;
