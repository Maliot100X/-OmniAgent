/**
 * Google Chat Channel Handler for OMNIGENT
 * Real integration using Google Chat API
 */

import axios from 'axios';

class GoogleChatHandler {
  constructor(config = {}) {
    this.webhookUrl = config.webhookUrl || process.env.GOOGLE_CHAT_WEBHOOK;
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;
    this.baseUrl = 'https://chat.googleapis.com/v1';
    this.spaces = {};
    this.status = 'disconnected';
  }

  async connect() {
    if (!this.webhookUrl && !this.apiKey) {
      throw new Error('Google Chat webhook URL or API key required');
    }

    try {
      this.status = 'connecting';

      if (this.webhookUrl) {
        // Test webhook
        const response = await axios.post(this.webhookUrl, {
          text: 'Testing connection...'
        });

        if (response.status === 200) {
          this.status = 'connected';
          return { success: true, method: 'webhook' };
        }
      }

      this.status = 'connected';
      return { success: true, method: 'api' };
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async disconnect() {
    this.status = 'disconnected';
    this.spaces = {};
    return { success: true };
  }

  async sendMessage(spaceId, text, options = {}) {
    if (this.status !== 'connected') {
      throw new Error('Google Chat handler not connected');
    }

    try {
      if (this.webhookUrl) {
        const payload = {
          text,
          ...options.cards && { cards: options.cards },
          ...options.thread && { threadKey: options.thread }
        };

        const response = await axios.post(this.webhookUrl, payload);

        return {
          success: response.status === 200,
          spaceId,
          timestamp: new Date().toISOString()
        };
      }

      const url = `${this.baseUrl}/spaces/${spaceId}/messages`;
      const payload = {
        text,
        ...options.cards && { cardsV2: options.cards }
      };

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      });

      return {
        success: response.status === 200,
        messageId: response.data.name,
        spaceId
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendCard(spaceId, card) {
    const payload = {
      sections: [
        {
          widgets: card.widgets || []
        }
      ]
    };

    return this.sendMessage(spaceId, '', {
      cards: [payload]
    });
  }

  async updateMessage(spaceId, messageId, text) {
    try {
      const url = `${this.baseUrl}/spaces/${spaceId}/messages/${messageId}`;
      const payload = { text };

      const response = await axios.patch(url, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      });

      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteMessage(spaceId, messageId) {
    try {
      const url = `${this.baseUrl}/spaces/${spaceId}/messages/${messageId}`;

      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      });

      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addSpace(spaceId, spaceName, type = 'SPACE') {
    this.spaces[spaceId] = {
      name: spaceName,
      type,
      addedAt: new Date().toISOString()
    };
    return this.spaces[spaceId];
  }

  async getSpaces() {
    return Object.entries(this.spaces).map(([id, space]) => ({
      spaceId: id,
      ...space
    }));
  }

  async handleEventCallback(event) {
    const { type, message, space, user } = event;

    if (type === 'MESSAGE') {
      return {
        type: 'message',
        spaceId: space.name,
        userId: user.name,
        text: message.text,
        timestamp: new Date().toISOString()
      };
    }

    return { type, handled: false };
  }

  async getStatus() {
    return {
      platform: 'google-chat',
      status: this.status,
      connected: this.status === 'connected',
      spaceCount: Object.keys(this.spaces).length,
      lastUpdate: new Date().toISOString()
    };
  }

  async broadcast(text, spaces = []) {
    const results = [];
    const targetSpaces = spaces.length > 0 ? spaces : Object.keys(this.spaces);

    for (const spaceId of targetSpaces) {
      try {
        const result = await this.sendMessage(spaceId, text);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, spaceId });
      }
    }

    return results;
  }

  async createThread(spaceId, text) {
    const threadKey = `thread_${Date.now()}`;
    return this.sendMessage(spaceId, text, { thread: threadKey });
  }

  async replyToThread(spaceId, threadKey, text) {
    return this.sendMessage(spaceId, text, { thread: threadKey });
  }
}

export default GoogleChatHandler;
