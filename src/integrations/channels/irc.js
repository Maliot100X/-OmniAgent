/**
 * IRC Channel Handler for OMNIGENT
 * Real integration using IRC protocol
 */

import net from 'net';

class IRCHandler {
  constructor(config = {}) {
    this.host = config.host || 'irc.libera.chat';
    this.port = config.port || 6667;
    this.nickname = config.nickname || 'omnigent-bot';
    this.channels = {};
    this.status = 'disconnected';
    this.socket = null;
    this.messageBuffer = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.status = 'connecting';
        this.socket = net.createConnection(this.port, this.host);

        this.socket.on('connect', () => {
          this.send(`NICK ${this.nickname}`);
          this.send(`USER ${this.nickname} 0 * :OMNIGENT Agent`);
          this.status = 'connected';
          resolve({ success: true, nickname: this.nickname });
        });

        this.socket.on('data', (data) => {
          this.handleData(data.toString());
        });

        this.socket.on('error', (error) => {
          this.status = 'error';
          reject(error);
        });

        setTimeout(() => {
          if (this.status === 'connecting') {
            reject(new Error('Connection timeout'));
          }
        }, 5000);
      } catch (error) {
        this.status = 'error';
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.send('QUIT');
      this.socket.destroy();
    }
    this.status = 'disconnected';
    this.channels = {};
    return { success: true };
  }

  send(command) {
    if (this.socket) {
      this.socket.write(`${command}\r\n`);
    }
  }

  handleData(data) {
    const lines = data.split('\r\n');
    for (const line of lines) {
      if (line.includes('PING')) {
        this.send('PONG :' + line.split(':')[1]);
      }
    }
  }

  async joinChannel(channelName) {
    this.send(`JOIN ${channelName}`);
    this.channels[channelName] = {
      name: channelName,
      joined: true,
      joinedAt: new Date().toISOString()
    };
    return { success: true, channelName };
  }

  async leaveChannel(channelName) {
    this.send(`PART ${channelName}`);
    delete this.channels[channelName];
    return { success: true, channelName };
  }

  async sendMessage(channelName, text) {
    if (this.status !== 'connected') {
      throw new Error('IRC handler not connected');
    }

    this.send(`PRIVMSG ${channelName} :${text}`);
    return {
      success: true,
      channel: channelName,
      message: text,
      timestamp: new Date().toISOString()
    };
  }

  async getStatus() {
    return {
      platform: 'irc',
      status: this.status,
      connected: this.status === 'connected',
      nickname: this.nickname,
      host: this.host,
      port: this.port,
      channelCount: Object.keys(this.channels).length,
      lastUpdate: new Date().toISOString()
    };
  }

  async broadcast(text, channelNames = []) {
    const results = [];
    const targets = channelNames.length > 0 ? channelNames : Object.keys(this.channels);

    for (const channel of targets) {
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

export default IRCHandler;
