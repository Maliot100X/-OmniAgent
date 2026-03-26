export class AutomationEngine {
  constructor() {
    this.automations = new Map();
    this.triggers = new Map();
    this.actions = new Map();
  }

  createAutomation(name, trigger, action) {
    const automation = {
      id: 'auto_' + Date.now(),
      name,
      trigger,
      action,
      enabled: true,
      executions: 0,
      lastRun: null
    };
    this.automations.set(automation.id, automation);
    return automation;
  }

  registerTrigger(name, handler) {
    this.triggers.set(name, handler);
    return { success: true };
  }

  registerAction(name, handler) {
    this.actions.set(name, handler);
    return { success: true };
  }

  enableAutomation(id) {
    const a = this.automations.get(id);
    if (!a) return { error: 'Not found' };
    a.enabled = true;
    return { success: true };
  }

  disableAutomation(id) {
    const a = this.automations.get(id);
    if (!a) return { error: 'Not found' };
    a.enabled = false;
    return { success: true };
  }

  executeAutomation(id, context) {
    const a = this.automations.get(id);
    if (!a || !a.enabled) return { error: 'Automation not available' };
    a.executions++;
    a.lastRun = new Date();
    return { success: true, automation: a.name };
  }

  listAutomations() {
    return Array.from(this.automations.values());
  }
}

export default AutomationEngine;
