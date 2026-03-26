export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  loadPlugin(name, plugin) {
    if (plugin.init) plugin.init();
    this.plugins.set(name, plugin);
    return { success: true, plugin: name };
  }

  unloadPlugin(name) {
    const p = this.plugins.get(name);
    if (p && p.destroy) p.destroy();
    this.plugins.delete(name);
    return { success: true };
  }

  registerHook(name, handler) {
    if (!this.hooks.has(name)) this.hooks.set(name, []);
    this.hooks.get(name).push(handler);
  }

  executeHook(name, context) {
    if (!this.hooks.has(name)) return context;
    let result = context;
    for (const handler of this.hooks.get(name)) {
      result = handler(result);
    }
    return result;
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  listPlugins() {
    return Array.from(this.plugins.keys());
  }
}

export default PluginManager;
