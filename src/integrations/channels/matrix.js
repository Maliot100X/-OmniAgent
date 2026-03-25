/**
 * Matrix Channel Handler for OMNIGENT
 * Real integration using Matrix Client-Server API
 */

import axios from 'axios';

class MatrixHandler {
  constructor(config = {}) {
    this.homeserver = config.homeserver || 'https://matrix.org';
    this.userId = config.userId;
    this.accessToken = config.accessToken;
    this.rooms = {};
    this.status = 'disconnected';
    this.syncToken = null;
  }

  async connect() {
    if (!this.accessToken || !this.userId) {
      throw new Error('Matrix access token and user ID required');
    }

    try {
      this.status = 'connecting';

      const response = await axios.get(`${this.homeserver}/_matrix/client/v3/sync`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (response.status === 200) {
        this.syncToken = response.data.next_batch;
        this.status = 'connected';
        return { success: true, userId: this.userId };
      }

      throw new Error('Failed to sync');
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async disconnect() {
    this.status = 'disconnected';
    this.rooms = {};
    return { success: true };
  }

  async sendMessage(roomId, text) {
    if (this.status !== 'connected') {
      throw new Error('Matrix handler not connected');
    }

    try {
      const url = `${this.homeserver}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${Date.now()}`;
      const payload = {
        msgtype: 'm.text',
        body: text
      };

      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      return {
        success: response.status === 200,
        eventId: response.data.event_id,
        roomId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createRoom(roomName, topic = '') {
    try {
      const url = `${this.homeserver}/_matrix/client/v3/createRoom`;
      const payload = {
        room_alias_name: roomName.toLowerCase().replace(/\s+/g, '_'),
        name: roomName,
        topic,
        visibility: 'public'
      };

      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      const roomId = response.data.room_id;
      this.rooms[roomId] = {
        name: roomName,
        topic,
        createdAt: new Date().toISOString()
      };

      return { success: true, roomId, roomName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async joinRoom(roomId) {
    try {
      const url = `${this.homeserver}/_matrix/client/v3/rooms/${roomId}/join`;

      const response = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.rooms[roomId] = {
        joined: true,
        joinedAt: new Date().toISOString()
      };

      return { success: response.status === 200, roomId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStatus() {
    return {
      platform: 'matrix',
      status: this.status,
      connected: this.status === 'connected',
      userId: this.userId,
      homeserver: this.homeserver,
      roomCount: Object.keys(this.rooms).length,
      lastUpdate: new Date().toISOString()
    };
  }

  async broadcast(text, roomIds = []) {
    const results = [];
    const targets = roomIds.length > 0 ? roomIds : Object.keys(this.rooms);

    for (const roomId of targets) {
      try {
        const result = await this.sendMessage(roomId, text);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, roomId });
      }
    }

    return results;
  }
}

export default MatrixHandler;
