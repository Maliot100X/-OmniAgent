/**
 * WebSocket Channel Handler for OMNIGENT
 * Real integration for WebSocket-based messaging
 */

import WebSocket from 'ws';
import http from 'http';

class WebSocketHandler {
  constructor(config = {}) {
    this.serverPort = config.port || 8765;
    this.clients = {};
    this.server = null;
    this.wss = null;
    this.status = 'disconnected';
    this.messageHistory = [];
  }

  async connect() {
    return new Promise((resolve) => {
      try {
        this.status = 'connecting';
        this.server = http.createServer();
        this.wss = new WebSocket.Server({ server: this.server });

        this.wss.on('connection', (ws) => {
          const clientId = `client_${Date.now()}`;
          this.clients[clientId] = {
            ws,
            connected: true,
            connectedAt: new Date().toISOString()
          };

          ws.on('message', (message) => {
            this.handleMessage(clientId, message);
          });

          ws.on('close', () => {
            delete this.clients[clientId];
          });
        });

        this.server.listen(this.serverPort, () => {
          this.status = 'connected';
          resolve({
            success: true,
            port: this.serverPort,
            url: `ws://localhost:${this.serverPort}`
          });
        });
      } catch (error) {
        this.status = 'error';
        resolve({ success: false, error: error.message });
      }
    });
  }

  disconnect() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.server) {
      this.server.close();
    }
    this.clients = {};
    this.status = 'disconnected';
    return { success: true };
  }

  handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      this.messageHistory.push({
        clientId,
        data,
        timestamp: new Date().toISOString()
      });

      // Broadcast to all connected clients
      this.broadcast(JSON.stringify({
        from: clientId,
        ...data
      }));
    } catch (e) {
      console.error('Error handling message:', e);
    }
  }

  async sendMessage(clientId, message) {
    if (!this.clients[clientId]) {
      return { success: false, error: 'Client not found' };
    }

    try {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      this.clients[clientId].ws.send(payload);

      return {
        success: true,
        clientId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  broadcast(message) {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    for (const [, client] of Object.entries(this.clients)) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }

    return { success: true, clientCount: Object.keys(this.clients).length };
  }

  getConnectedClients() {
    return Object.entries(this.clients).map(([id, client]) => ({
      clientId: id,
      connectedAt: client.connectedAt,
      status: 'connected'
    }));
  }

  getStatus() {
    return {
      platform: 'websocket',
      status: this.status,
      connected: this.status === 'connected',
      port: this.serverPort,
      clientCount: Object.keys(this.clients).length,
      messageCount: this.messageHistory.length,
      lastUpdate: new Date().toISOString()
    };
  }

  getMessageHistory(limit = 100) {
    return this.messageHistory.slice(-limit);
  }
}

export default WebSocketHandler;
