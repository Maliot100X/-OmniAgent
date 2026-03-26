/**
 * Advanced Webhook System for OMNIGENT
 * Event-driven architecture for real-time integrations
 */

import express from 'express';
import crypto from 'crypto';

class WebhookManager {
  constructor() {
    this.webhooks = {};
    this.history = [];
    this.app = express();
    this.server = null;
    this.port = 8789;
  }

  /**
   * Register webhook
   */
  registerWebhook(event, url, secret = null, active = true) {
    const id = `webhook_${Date.now()}`;
    this.webhooks[id] = {
      event,
      url,
      secret,
      active,
      created: new Date().toISOString(),
      lastTriggered: null,
      successCount: 0,
      failureCount: 0
    };
    return {
      success: true,
      webhookId: id,
      event,
      url
    };
  }

  /**
   * Trigger webhook
   */
  async triggerWebhook(event, payload) {
    const results = [];

    for (const [id, webhook] of Object.entries(this.webhooks)) {
      if (webhook.event === event && webhook.active) {
        try {
          const headers = {};
          
          // Add signature if secret exists
          if (webhook.secret) {
            const signature = crypto
              .createHmac('sha256', webhook.secret)
              .update(JSON.stringify(payload))
              .digest('hex');
            headers['X-Webhook-Signature'] = signature;
          }

          headers['Content-Type'] = 'application/json';
          headers['X-Webhook-ID'] = id;
          headers['X-Webhook-Event'] = event;

          const response = await axios.post(webhook.url, payload, { headers });

          webhook.successCount++;
          webhook.lastTriggered = new Date().toISOString();

          results.push({
            webhookId: id,
            success: true,
            statusCode: response.status
          });
        } catch (error) {
          webhook.failureCount++;
          results.push({
            webhookId: id,
            success: false,
            error: error.message
          });
        }

        this.history.push({
          webhookId: id,
          event,
          timestamp: new Date().toISOString(),
          success: results[results.length - 1].success
        });
      }
    }

    return {
      event,
      triggered: results.length,
      results
    };
  }

  /**
   * List webhooks
   */
  listWebhooks() {
    return Object.entries(this.webhooks).map(([id, webhook]) => ({
      id,
      ...webhook
    }));
  }

  /**
   * Update webhook
   */
  updateWebhook(webhookId, updates) {
    if (!this.webhooks[webhookId]) {
      return { success: false, error: 'Webhook not found' };
    }

    Object.assign(this.webhooks[webhookId], updates);
    return { success: true, webhookId };
  }

  /**
   * Delete webhook
   */
  deleteWebhook(webhookId) {
    if (!this.webhooks[webhookId]) {
      return { success: false, error: 'Webhook not found' };
    }

    delete this.webhooks[webhookId];
    return { success: true, deleted: webhookId };
  }

  /**
   * Get webhook history
   */
  getWebhookHistory(limit = 100) {
    return this.history.slice(-limit);
  }

  /**
   * Start webhook server
   */
  async startServer() {
    this.app.use(express.json());

    // Webhook reception endpoint
    this.app.post('/webhooks/receive/:platform', async (req, res) => {
      const { platform } = req.params;
      await this.triggerWebhook(`${platform}:message`, req.body);
      res.json({ received: true });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        webhooks: Object.keys(this.webhooks).length
      });
    });

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        resolve({
          success: true,
          port: this.port,
          url: `http://localhost:${this.port}`
        });
      });
    });
  }

  /**
   * Stop webhook server
   */
  async stopServer() {
    if (this.server) {
      this.server.close();
      return { success: true };
    }
    return { success: false, error: 'Server not running' };
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId) {
    const webhook = this.webhooks[webhookId];
    if (!webhook) {
      return { success: false, error: 'Webhook not found' };
    }

    const testPayload = {
      test: true,
      timestamp: new Date().toISOString()
    };

    try {
      const headers = {};
      if (webhook.secret) {
        headers['X-Webhook-Signature'] = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(testPayload))
          .digest('hex');
      }

      const response = await axios.post(webhook.url, testPayload, { headers });
      return {
        success: true,
        statusCode: response.status,
        message: 'Webhook test successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new WebhookManager();
