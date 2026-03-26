export class AgentEngine {
  constructor() {
    this.agents = new Map();
    this.behaviors = {};
  }

  createAgent(name, config) {
    const agent = {
      id: 'agent_' + Date.now(),
      name,
      type: config.type || 'general',
      provider: config.provider || 'claude',
      behaviors: config.behaviors || [],
      memory: [],
      created: new Date()
    };
    this.agents.set(agent.id, agent);
    return agent;
  }

  addBehavior(agentId, name, handler) {
    if (!this.agents.has(agentId)) return { error: 'Agent not found' };
    this.behaviors[agentId + '_' + name] = handler;
    return { success: true };
  }

  executeAgent(agentId, task, context = {}) {
    const agent = this.agents.get(agentId);
    if (!agent) return { error: 'Agent not found' };
    return { success: true, result: `Executed ${task}`, agentId };
  }

  deleteAgent(agentId) {
    this.agents.delete(agentId);
    return { success: true };
  }

  listAgents() {
    return Array.from(this.agents.values());
  }

  getAgent(agentId) {
    return this.agents.get(agentId);
  }
}

export default AgentEngine;
