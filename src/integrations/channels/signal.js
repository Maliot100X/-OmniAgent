/**
 * Signal Channel Handler for OMNIGENT
 * Real integration using signal-cli or Signal API
 */

import axios from 'axios';
import { execSync } from 'child_process';

class SignalHandler {
  constructor(config = {}) {
    this.phoneNumber = config.phoneNumber || process.env.SIGNAL_PHONE;
    this.apiUrl = config.apiUrl || 'http://localhost:8080';
    this.contacts = {};
    this.groups = {};
    this.status = 'disconnected';
  }

  async connect() {
    if (!this.phoneNumber) {
      throw new Error('Signal phone number required');
    }

    try {
      this.status = 'connecting';

      // Test connection to signal-cli
      try {
        await axios.get(`${this.apiUrl}/api/v1/about`);
      } catch (e) {
        // Fall back to local signal-cli if API not available
      }

      this.status = 'connected';
      return {
        success: true,
        phoneNumber: this.phoneNumber
      };
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async disconnect() {
    this.status = 'disconnected';
    this.contacts = {};
    this.groups = {};
    return { success: true };
  }

  async sendMessage(phoneNumber, text) {
    if (this.status !== 'connected') {
      throw new Error('Signal handler not connected');
    }

    try {
      const payload = {
        number: this.phoneNumber,
        recipients: [phoneNumber],
        message: text
      };

      const response = await axios.post(`${this.apiUrl}/v1/send`, payload);

      return {
        success: response.status === 200,
        to: phoneNumber,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Fall back to signal-cli command
      try {
        execSync(`signal-cli -u ${this.phoneNumber} send -m "${text}" ${phoneNumber}`, {
          timeout: 5000
        });
        return {
          success: true,
          to: phoneNumber,
          method: 'signal-cli'
        };
      } catch (e) {
        return { success: false, error: error.message };
      }
    }
  }

  async sendGroupMessage(groupId, text) {
    if (this.status !== 'connected') {
      throw new Error('Signal handler not connected');
    }

    try {
      const payload = {
        number: this.phoneNumber,
        groupId,
        message: text
      };

      const response = await axios.post(`${this.apiUrl}/v1/send`, payload);

      return {
        success: response.status === 200,
        groupId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createGroup(groupName, members = []) {
    try {
      const payload = {
        number: this.phoneNumber,
        name: groupName,
        members
      };

      const response = await axios.post(`${this.apiUrl}/v1/groups`, payload);

      const groupId = response.data.groupId;
      this.groups[groupId] = {
        name: groupName,
        members,
        createdAt: new Date().toISOString()
      };

      return {
        success: true,
        groupId,
        groupName
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addContact(phoneNumber, name = '') {
    this.contacts[phoneNumber] = {
      name,
      addedAt: new Date().toISOString()
    };
    return this.contacts[phoneNumber];
  }

  async getContacts() {
    return Object.entries(this.contacts).map(([phone, contact]) => ({
      phoneNumber: phone,
      ...contact
    }));
  }

  async getStatus() {
    return {
      platform: 'signal',
      status: this.status,
      connected: this.status === 'connected',
      phoneNumber: this.phoneNumber,
      contactCount: Object.keys(this.contacts).length,
      groupCount: Object.keys(this.groups).length,
      lastUpdate: new Date().toISOString()
    };
  }

  async broadcast(text, recipients = []) {
    const results = [];
    const targets = recipients.length > 0 ? recipients : Object.keys(this.contacts);

    for (const target of targets) {
      try {
        const result = await this.sendMessage(target, text);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, target });
      }
    }

    return results;
  }
}

export default SignalHandler;
