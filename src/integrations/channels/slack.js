/**
 * Slack Channel Handler for OMNIGENT
 * Real integration using Slack Bot API and Webhooks
 */

import axios from 'axios';

class SlackHandler {
  constructor(config = {}) {
    this.botToken = config.botToken || process.env.SLACK_BOT_TOKEN;
    this.webhookUrl = config.webhookUrl || process.env.SLACK_WEBHOOK_URL;
    this.appId = config.appId;
    this.baseUrl = 'https://slack.com/api';
    this.channels = {};
    this.status = 'disconnected';
    this.users = {};
  }

  async connect() {
    if (!this.botToken && !this.webhookUrl) {
      throw new Error('Slack bot token or webhook URL required');
    }

    try {
      this.status = 'connecting';

      if (this.botToken) {
        const response = await axios.get(`${this.baseUrl}/auth.test`, {
          headers: { Authorization: `Bearer ${this.botToken}` }
        });

        if (response.data.ok) {
          this.userId = response.data.user_id;
          this.teamId = response.data.team_id;
          this.status = 'connected';
          return {
            success: true,
            userId: this.userId,
            teamId: this.teamId
          };
        }
      } else if (this.webhookUrl) {
        this.status = 'connected';
        return { success: true, method: 'webhook' };
      }

      throw new Error('Failed to authenticate');
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async disconnect() {
    this.status = 'disconnected';
    this.channels = {};
    return { success: true };
  }

  async sendMessage(channel, text, options = {}) {
    if (this.status !== 'connected') {
      throw new Error('Slack handler not connected');
    }

    try {
      if (this.webhookUrl) {
        const payload = {
          channel,
          text,
          ...options.blocks && { blocks: options.blocks },
          ...options.attachments && { attachments: options.attachments }
        };

        const response = await axios.post(this.webhookUrl, payload);
        return {
          success: response.status === 200,
          timestamp: new Date().toISOString()
        };
      }

      const payload = {
        channel,
        text,
        ...options.blocks && { blocks: options.blocks },
        ...options.threadTs && { thread_ts: options.threadTs }
      };

      const response = await axios.post(`${this.baseUrl}/chat.postMessage`, payload, {
        headers: { Authorization: `Bearer ${this.botToken}` }
      });

      return {
        success: response.data.ok,
        messageId: response.data.ts,
        channel
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendThreadReply(channel, threadTs, text, options = {}) {
    return this.sendMessage(channel, text, {
      ...options,
      threadTs
    });
  }

  async updateMessage(channel, messageId, text) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat.update`, {
        channel,
        ts: messageId,
        text
      }, {
        headers: { Authorization: `Bearer ${this.botToken}` }
      });

      return { success: response.data.ok };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteMessage(channel, messageId) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat.delete`, {
        channel,
        ts: messageId
      }, {
        headers: { Authorization: `Bearer ${this.botToken}` }
      });

      return { success: response.data.ok };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getChannels() {
    try {
      const response = await axios.get(`${this.baseUrl}/conversations.list`, {
        headers: { Authorization: `Bearer ${this.botToken}` }
      });

      if (response.data.ok) {
        return response.data.channels.map(ch => ({
          id: ch.id,
          name: ch.name,
          topic: ch.topic?.value,
          isPrivate: ch.is_private
        }));
      }

      return [];
    } catch (error) {
      console.error('Error getting channels:', error.message);
      return [];
    }
  }

  async addChannel(channelId, channelName) {
    this.channels[channelId] = {
      name: channelName,
      addedAt: new Date().toISOString()
    };
    return this.channels[channelId];
  }

  async handleEventCallback(payload) {
    const { type, user, channel, text, thread_ts } = payload.event;

    return {
      type,
      user,
      channel,
      text,
      threadTs: thread_ts,
      timestamp: new Date().toISOString()
    };
  }

  async getStatus() {
    return {
      platform: 'slack',
      status: this.status,
      connected: this.status === 'connected',
      userId: this.userId,
      teamId: this.teamId,
      channelCount: Object.keys(this.channels).length,
      lastUpdate: new Date().toISOString()
    };
  }

  async broadcast(text, channels = []) {
    const targetChannels = channels.length > 0 ? channels : Object.keys(this.channels);
    const results = [];

    for (const channel of targetChannels) {
      try {
        const result = await this.sendMessage(channel, text);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, channel });
      }
    }

    return results;
  }
}

export default SlackHandler;
