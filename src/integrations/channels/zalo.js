/**
 * Zalo Channel Handler for OMNIGENT
 * Real integration using Zalo Bot API
 */

import axios from 'axios';

class ZaloHandler {
  constructor(config = {}) {
    this.accessToken = config.accessToken || process.env.ZALO_ACCESS_TOKEN;
    this.phoneNumber = config.phoneNumber || process.env.ZALO_PHONE;
    this.baseUrl = 'https://openapi.zalo.me/v2.0';
    this.conversations = {};
    this.status = 'disconnected';
  }

  async connect() {
    if (!this.accessToken) {
      throw new Error('Zalo access token required');
    }

    try {
      this.status = 'connecting';

      const response = await axios.get(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (response.status === 200) {
        this.status = 'connected';
        return { success: true, phoneNumber: this.phoneNumber };
      }

      throw new Error('Failed to authenticate');
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async disconnect() {
    this.status = 'disconnected';
    this.conversations = {};
    return { success: true };
  }

  async sendMessage(userId, text, options = {}) {
    if (this.status !== 'connected') {
      throw new Error('Zalo handler not connected');
    }

    try {
      const payload = {
        recipient: { user_id: userId },
        message: { text },
        ...options.attachment && { attachment: options.attachment }
      };

      const response = await axios.post(`${this.baseUrl}/message/send`, payload, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (response.data.error === 0) {
        return {
          success: true,
          messageId: response.data.data?.message_id,
          userId,
          timestamp: new Date().toISOString()
        };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendAttachment(userId, attachmentUrl, attachmentType = 'image') {
    const attachment = {
      type: attachmentType,
      payload: { url: attachmentUrl }
    };

    return this.sendMessage(userId, '', { attachment });
  }

  async addConversation(userId, name = '') {
    this.conversations[userId] = {
      name,
      messages: [],
      addedAt: new Date().toISOString()
    };
    return this.conversations[userId];
  }

  async getConversations() {
    return Object.entries(this.conversations).map(([userId, conv]) => ({
      userId,
      ...conv
    }));
  }

  async handleWebhookEvent(event) {
    const { sender, recipient, message, timestamp } = event;

    if (this.conversations[sender.id]) {
      this.conversations[sender.id].messages.push({
        from: sender.id,
        text: message.text,
        timestamp: new Date(timestamp * 1000).toISOString()
      });
    }

    return {
      type: 'message',
      userId: sender.id,
      text: message.text,
      timestamp: new Date(timestamp * 1000).toISOString()
    };
  }

  async getStatus() {
    return {
      platform: 'zalo',
      status: this.status,
      connected: this.status === 'connected',
      conversationCount: Object.keys(this.conversations).length,
      lastUpdate: new Date().toISOString()
    };
  }

  async broadcast(text, userIds = []) {
    const results = [];
    const targets = userIds.length > 0 ? userIds : Object.keys(this.conversations);

    for (const userId of targets) {
      try {
        const result = await this.sendMessage(userId, text);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, userId });
      }
    }

    return results;
  }
}

export default ZaloHandler;
