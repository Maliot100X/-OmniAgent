// Unified Platform Manager - 19 platforms
import DiscordHandler from './channels/discord.js';
import TelegramHandler from './channels/telegram.js';
import WhatsAppHandler from './channels/whatsapp.js';
import SlackHandler from './channels/slack.js';
import TeamsHandler from './channels/teams.js';
import SignalHandler from './channels/signal.js';
import GoogleChatHandler from './channels/google-chat.js';
import MatrixHandler from './channels/matrix.js';
import IRCHandler from './channels/irc.js';
import EmailHandler from './channels/email.js';
import WebSocketHandler from './channels/websocket.js';
import ZaloHandler from './channels/zalo.js';
import ViberHandler from './channels/viber.js';
import SkypeHandler from './channels/skype.js';
import LINEHandler from './channels/line.js';
import TwitchHandler from './channels/twitch.js';
import LinkedInHandler from './channels/linkedin.js';

export class PlatformManager {
  constructor() {
    this.platforms = {};
    this.handlers = {
      discord: DiscordHandler,
      telegram: TelegramHandler,
      whatsapp: WhatsAppHandler,
      slack: SlackHandler,
      teams: TeamsHandler,
      signal: SignalHandler,
      'google-chat': GoogleChatHandler,
      matrix: MatrixHandler,
      irc: IRCHandler,
      email: EmailHandler,
      websocket: WebSocketHandler,
      zalo: ZaloHandler,
      viber: ViberHandler,
      skype: SkypeHandler,
      line: LINEHandler,
      twitch: TwitchHandler,
      linkedin: LinkedInHandler
    };
  }

  connectPlatform(name, config) {
    const HandlerClass = this.handlers[name];
    if (!HandlerClass) throw new Error(`Unknown platform: ${name}`);
    const instance = new HandlerClass(config);
    this.platforms[name] = instance;
    return instance.connect ? instance.connect() : { platform: name, status: 'connected' };
  }

  disconnectPlatform(name) {
    if (this.platforms[name]) {
      delete this.platforms[name];
    }
    return { platform: name, status: 'disconnected' };
  }

  listPlatforms() {
    return Object.keys(this.handlers);
  }

  getConnectedPlatforms() {
    return Object.keys(this.platforms);
  }

  getPlatform(name) {
    return this.platforms[name];
  }
}

export default PlatformManager;
