/**
 * Channel Manager for OMNIGENT
 * Manages all messaging platform integrations
 */

import DiscordHandler from './channels/discord.js';
import TelegramHandler from './channels/telegram.js';
import WhatsAppHandler from './channels/whatsapp.js';

class ChannelManager {
  constructor(config = {}) {
    this.handlers = {
      discord: new DiscordHandler(config.discord || {}),
      telegram: new TelegramHandler(config.telegram || {}),
      whatsapp: new WhatsAppHandler(config.whatsapp || {})
    };
    this.activeChannels = {};
    this.messageQueue = [];
  }

  /**
   * Connect to a specific channel
   */
  async connectChannel(platform, credentials = {}) {
    if (!this.handlers[platform]) {
      throw new Error(`Platform "${platform}" not supported`);
    }

    try {
      const handler = this.handlers[platform];
      const result = await handler.connect();
      
      this.activeChannels[platform] = {
        handler,
        status: 'connected',
        credentials: this.maskCredentials(credentials),
        connectedAt: new Date().toISOString()
      };

      return {
        success: true,
        platform,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        platform,
        error: error.message
      };
    }
  }

  /**
   * Disconnect from a specific channel
   */
  async disconnectChannel(platform) {
    if (!this.activeChannels[platform]) {
      return { success: false, error: `${platform} not connected` };
    }

    try {
      await this.handlers[platform].disconnect();
      delete this.activeChannels[platform];
      return { success: true, platform };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send message across platforms
   */
  async sendMessage(platform, target, message, options = {}) {
    if (!this.activeChannels[platform]) {
      return {
        success: false,
        error: `${platform} not connected`
      };
    }

    try {
      const handler = this.handlers[platform];
      const result = await handler.sendMessage(target, message, options);

      // Add to message queue for history
      this.messageQueue.push({
        platform,
        target,
        message,
        result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Broadcast message to all connected platforms
   */
  async broadcastMessage(message, targetPlatforms = null, options = {}) {
    const platforms = targetPlatforms || Object.keys(this.activeChannels);
    const results = {};

    for (const platform of platforms) {
      if (this.activeChannels[platform]) {
        try {
          const handler = this.handlers[platform];
          results[platform] = await handler.broadcast(message, options);
        } catch (error) {
          results[platform] = { success: false, error: error.message };
        }
      }
    }

    return results;
  }

  /**
   * Get all active channels
   */
  getActiveChannels() {
    return Object.entries(this.activeChannels).map(([platform, config]) => ({
      platform,
      status: config.status,
      connectedAt: config.connectedAt,
      handler: this.handlers[platform].getStatus()
    }));
  }

  /**
   * Get channel status
   */
  getChannelStatus(platform) {
    if (!this.activeChannels[platform]) {
      return { platform, status: 'disconnected' };
    }

    return {
      platform,
      ...this.handlers[platform].getStatus()
    };
  }

  /**
   * Handle incoming webhook event
   */
  async handleWebhookEvent(platform, webhookData) {
    if (!this.handlers[platform]) {
      return { success: false, error: `Platform "${platform}" not supported` };
    }

    try {
      const handler = this.handlers[platform];
      const event = await handler.handleWebhookEvent(webhookData);

      return {
        success: true,
        platform,
        event
      };
    } catch (error) {
      return {
        success: false,
        platform,
        error: error.message
      };
    }
  }

  /**
   * Get message history
   */
  getMessageHistory(limit = 100, platform = null) {
    let messages = this.messageQueue;

    if (platform) {
      messages = messages.filter(m => m.platform === platform);
    }

    return messages.slice(-limit);
  }

  /**
   * Mask sensitive credentials
   */
  maskCredentials(credentials) {
    const masked = { ...credentials };
    for (const key of ['token', 'apiKey', 'secret', 'password']) {
      if (masked[key]) {
        masked[key] = '***' + masked[key].slice(-4);
      }
    }
    return masked;
  }

  /**
   * Get all supported platforms
   */
  getSupportedPlatforms() {
    return Object.keys(this.handlers);
  }

  /**
   * Get platform-specific handler
   */
  getHandler(platform) {
    return this.handlers[platform] || null;
  }

  /**
   * Check if platform is connected
   */
  isConnected(platform) {
    return !!this.activeChannels[platform];
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      totalPlatforms: Object.keys(this.handlers).length,
      connectedPlatforms: Object.keys(this.activeChannels).length,
      totalMessages: this.messageQueue.length,
      platforms: {}
    };

    for (const platform of Object.keys(this.handlers)) {
      stats.platforms[platform] = {
        connected: this.isConnected(platform),
        status: this.handlers[platform].getStatus()
      };
    }

    return stats;
  }

  /**
   * Send rich message with formatting
   */
  async sendRichMessage(platform, target, content, options = {}) {
    const handler = this.handlers[platform];
    if (!handler) {
      return { success: false, error: `Platform not found` };
    }

    // Platform-specific rich message handling
    if (platform === 'discord' && handler.sendEmbed) {
      return await handler.sendEmbed(target, content);
    }

    if (platform === 'telegram' && handler.sendMessageWithButtons) {
      return await handler.sendMessageWithButtons(target, content.text, content.buttons, options);
    }

    if (platform === 'whatsapp' && handler.sendButtonMessage) {
      return await handler.sendButtonMessage(target, content.text, content.buttons);
    }

    return { success: false, error: 'Rich messages not supported for this platform' };
  }
}

export default ChannelManager;
