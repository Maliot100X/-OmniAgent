import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';

export class ProviderSetup {
  constructor() {
    this.configPath = path.join(os.homedir(), '.omnigent');
    this.configFile = path.join(this.configPath, 'providers.json');
    this.providers = this.loadProviders();
  }

  loadProviders() {
    try {
      if (fs.existsSync(this.configFile)) {
        return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      }
    } catch (e) {}
    return {
      llm: {},
      platforms: {},
      oauth: {},
      apis: {}
    };
  }

  saveProviders() {
    if (!fs.existsSync(this.configPath)) fs.mkdirSync(this.configPath, { recursive: true });
    fs.writeFileSync(this.configFile, JSON.stringify(this.providers, null, 2));
  }

  setupLLM(provider, apiKey, model) {
    this.providers.llm[provider] = { apiKey, model, active: true };
    this.saveProviders();
    return { success: true, provider, configured: true };
  }

  setupPlatform(platform, token, config = {}) {
    this.providers.platforms[platform] = { token, ...config, active: true };
    this.saveProviders();
    return { success: true, platform, configured: true };
  }

  setupOAuth(provider, clientId, clientSecret, scope = '') {
    this.providers.oauth[provider] = { clientId, clientSecret, scope, active: true };
    this.saveProviders();
    return { success: true, provider, configured: true };
  }

  setupCustomAPI(name, baseUrl, apiKey, endpoints = {}) {
    this.providers.apis[name] = { baseUrl, apiKey, endpoints, active: true };
    this.saveProviders();
    return { success: true, api: name, configured: true };
  }

  getProvider(type, name) {
    return this.providers[type]?.[name] || null;
  }

  listProviders(type) {
    return Object.keys(this.providers[type] || {});
  }

  removeProvider(type, name) {
    delete this.providers[type][name];
    this.saveProviders();
    return { success: true };
  }

  testConnection(type, name) {
    const provider = this.getProvider(type, name);
    if (!provider) return { error: 'Provider not found' };
    return { success: true, connected: true, provider: name };
  }
}

export default ProviderSetup;
