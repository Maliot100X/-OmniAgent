/**
 * Email Channel Handler for OMNIGENT
 * Real integration using SMTP/IMAP
 */

import nodemailer from 'nodemailer';

class EmailHandler {
  constructor(config = {}) {
    this.smtpConfig = {
      host: config.smtpHost || process.env.SMTP_HOST,
      port: config.smtpPort || process.env.SMTP_PORT || 587,
      secure: config.smtpSecure || false,
      auth: {
        user: config.emailUser || process.env.EMAIL_USER,
        pass: config.emailPassword || process.env.EMAIL_PASSWORD
      }
    };
    this.fromEmail = config.fromEmail || process.env.EMAIL_USER;
    this.transporter = null;
    this.recipients = {};
    this.status = 'disconnected';
  }

  async connect() {
    if (!this.smtpConfig.auth.user || !this.smtpConfig.auth.pass) {
      throw new Error('Email credentials required');
    }

    try {
      this.status = 'connecting';
      this.transporter = nodemailer.createTransport(this.smtpConfig);

      // Verify connection
      await this.transporter.verify();

      this.status = 'connected';
      return { success: true, email: this.fromEmail };
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async disconnect() {
    if (this.transporter) {
      this.transporter.close();
    }
    this.status = 'disconnected';
    return { success: true };
  }

  async sendMessage(to, subject, body, options = {}) {
    if (this.status !== 'connected') {
      throw new Error('Email handler not connected');
    }

    try {
      const mailOptions = {
        from: this.fromEmail,
        to,
        subject,
        html: options.html ? body : `<p>${body}</p>`,
        text: options.html ? undefined : body,
        ...options.attachments && { attachments: options.attachments }
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        to,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendHtml(to, subject, htmlContent) {
    return this.sendMessage(to, subject, htmlContent, { html: true });
  }

  async addRecipient(email, name = '') {
    this.recipients[email] = {
      name,
      addedAt: new Date().toISOString()
    };
    return this.recipients[email];
  }

  async getRecipients() {
    return Object.entries(this.recipients).map(([email, data]) => ({
      email,
      ...data
    }));
  }

  async getStatus() {
    return {
      platform: 'email',
      status: this.status,
      connected: this.status === 'connected',
      fromEmail: this.fromEmail,
      recipientCount: Object.keys(this.recipients).length,
      lastUpdate: new Date().toISOString()
    };
  }

  async broadcast(subject, body, recipients = []) {
    const results = [];
    const targets = recipients.length > 0 ? recipients : Object.keys(this.recipients);

    for (const email of targets) {
      try {
        const result = await this.sendMessage(email, subject, body);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, email });
      }
    }

    return results;
  }

  async sendTemplate(to, template, variables = {}) {
    // Simple template substitution
    let body = template;
    for (const [key, value] of Object.entries(variables)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return this.sendMessage(to, 'Message', body);
  }
}

export default EmailHandler;
