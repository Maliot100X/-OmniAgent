/**
 * Telegram Channel Handler for OMNIGENT
 * Real integration using Telegram Bot API
 */

import axios from 'axios';

class TelegramHandler {
  constructor(config = {}) {
    this.botToken = config.botToken || process.env.TELEGRAM_BOT_TOKEN;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    this.chats = {};
    this.status = 'disconnected';
    this.pollingOffset = 0;
  }

  /**
   * Connect to Telegram Bot API
   */
  async connect() {
    if (!this.botToken) {
      throw new Error('Telegram bot token required');
    }

    try {
      this.status = 'connecting';
      
      // Verify bot token by getting bot info
      const response = await axios.get(`${this.baseUrl}/getMe`);
      
      if (response.data.ok) {
        this.botInfo = response.data.result;
        this.status = 'connected';
        return {
          success: true,
          botId: this.botInfo.id,
          botName: this.botInfo.username
        };
      }

      throw new Error('Failed to get bot info');
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Disconnect from Telegram
   */
  async disconnect() {
    this.status = 'disconnected';
    this.chats = {};
    return { success: true };
  }

  /**
   * Send message to Telegram chat
   */
  async sendMessage(chatId, text, options = {}) {
    if (this.status !== 'connected') {
      throw new Error('Telegram handler not connected');
    }

    try {
      const payload = {
        chat_id: chatId,
        text,
        parse_mode: options.parseMode || 'Markdown',
        reply_to_message_id: options.replyToId,
        ...options.markup && { reply_markup: options.markup }
      };

      const response = await axios.post(`${this.baseUrl}/sendMessage`, payload);

      if (response.data.ok) {
        return {
          success: true,
          messageId: response.data.result.message_id,
          chatId,
          timestamp: new Date(response.data.result.date * 1000).toISOString()
        };
      }

      return { success: false, error: response.data.description };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send photo to Telegram chat
   */
  async sendPhoto(chatId, photoUrl, caption = '', options = {}) {
    try {
      const payload = {
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: options.parseMode || 'Markdown'
      };

      const response = await axios.post(`${this.baseUrl}/sendPhoto`, payload);

      return {
        success: response.data.ok,
        messageId: response.data.result?.message_id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send document to Telegram chat
   */
  async sendDocument(chatId, documentUrl, caption = '') {
    try {
      const payload = {
        chat_id: chatId,
        document: documentUrl,
        caption
      };

      const response = await axios.post(`${this.baseUrl}/sendDocument`, payload);

      return {
        success: response.data.ok,
        messageId: response.data.result?.message_id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Edit message in Telegram
   */
  async editMessage(chatId, messageId, text, options = {}) {
    try {
      const payload = {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: options.parseMode || 'Markdown'
      };

      const response = await axios.post(`${this.baseUrl}/editMessageText`, payload);

      return {
        success: response.data.ok,
        messageId: response.data.result?.message_id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete message in Telegram
   */
  async deleteMessage(chatId, messageId) {
    try {
      const response = await axios.post(`${this.baseUrl}/deleteMessage`, {
        chat_id: chatId,
        message_id: messageId
      });

      return { success: response.data.ok };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get updates from Telegram (polling method)
   */
  async getUpdates(timeout = 30) {
    try {
      const response = await axios.post(`${this.baseUrl}/getUpdates`, {
        offset: this.pollingOffset + 1,
        timeout
      });

      if (response.data.ok) {
        const updates = response.data.result;
        if (updates.length > 0) {
          this.pollingOffset = updates[updates.length - 1].update_id;
        }
        return updates;
      }

      return [];
    } catch (error) {
      console.error('Error getting updates:', error.message);
      return [];
    }
  }

  /**
   * Process webhook event from Telegram
   */
  async handleWebhookEvent(update) {
    const { update_id, message, callback_query, inline_query } = update;

    if (message) {
      return {
        type: 'message',
        chatId: message.chat.id,
        userId: message.from.id,
        text: message.text,
        messageId: message.message_id,
        timestamp: new Date(message.date * 1000).toISOString()
      };
    }

    if (callback_query) {
      return {
        type: 'callback_query',
        queryId: callback_query.id,
        userId: callback_query.from.id,
        data: callback_query.data
      };
    }

    if (inline_query) {
      return {
        type: 'inline_query',
        queryId: inline_query.id,
        query: inline_query.query
      };
    }

    return { type: 'unknown', update_id };
  }

  /**
   * Register webhook with Telegram
   */
  async setWebhook(webhookUrl) {
    try {
      const response = await axios.post(`${this.baseUrl}/setWebhook`, {
        url: webhookUrl
      });

      return {
        success: response.data.ok,
        webhookUrl: webhookUrl
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/getWebhookInfo`);

      if (response.data.ok) {
        return response.data.result;
      }

      return null;
    } catch (error) {
      console.error('Error getting webhook info:', error.message);
      return null;
    }
  }

  /**
   * Send inline keyboard with message
   */
  async sendMessageWithButtons(chatId, text, buttons, options = {}) {
    const markup = {
      inline_keyboard: buttons
    };

    return this.sendMessage(chatId, text, {
      ...options,
      markup
    });
  }

  /**
   * Add chat to handler
   */
  addChat(chatId, title, type = 'private') {
    this.chats[chatId] = {
      title,
      type,
      connectedAt: new Date().toISOString()
    };
    return this.chats[chatId];
  }

  /**
   * Get all connected chats
   */
  getChats() {
    return Object.entries(this.chats).map(([id, chat]) => ({
      chatId: id,
      ...chat
    }));
  }

  /**
   * Broadcast message to all chats
   */
  async broadcast(text, options = {}) {
    const results = [];
    for (const [chatId] of Object.entries(this.chats)) {
      try {
        const result = await this.sendMessage(chatId, text, options);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, chatId });
      }
    }
    return results;
  }

  /**
   * Get handler status
   */
  getStatus() {
    return {
      platform: 'telegram',
      status: this.status,
      connected: this.status === 'connected',
      botId: this.botInfo?.id,
      botName: this.botInfo?.username,
      chatCount: Object.keys(this.chats).length,
      lastUpdate: new Date().toISOString()
    };
  }
}

export default TelegramHandler;
