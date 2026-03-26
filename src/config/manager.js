import fs from 'fs';
import path from 'path';
import os from 'os';

export class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.omnigent');
    this.configFile = path.join(this.configDir, 'config.json');
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading config:', e);
    }
  }

  saveConfig() {
    if (!fs.existsSync(this.configDir)) fs.mkdirSync(this.configDir, { recursive: true });
    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
  }

  get(key, defaultValue = null) {
    return this.config[key] || defaultValue;
  }

  set(key, value) {
    this.config[key] = value;
    this.saveConfig();
    return { success: true };
  }

  delete(key) {
    delete this.config[key];
    this.saveConfig();
    return { success: true };
  }

  getAll() {
    return this.config;
  }

  reset() {
    this.config = {};
    this.saveConfig();
    return { success: true };
  }

  merge(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    return { success: true };
  }
}

export default ConfigManager;
