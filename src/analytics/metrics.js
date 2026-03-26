/**
 * Advanced Analytics & Monitoring System
 * Real-time metrics, logging, and performance tracking
 */

class Analytics {
  constructor() {
    this.metrics = {
      commands: {},
      agents: {},
      channels: {},
      errors: [],
      performance: []
    };
    this.startTime = Date.now();
  }

  /**
   * Track command execution
   */
  trackCommand(commandName, duration, success = true, error = null) {
    if (!this.metrics.commands[commandName]) {
      this.metrics.commands[commandName] = {
        count: 0,
        totalTime: 0,
        errors: 0,
        lastRun: null
      };
    }

    const cmd = this.metrics.commands[commandName];
    cmd.count++;
    cmd.totalTime += duration;
    if (!success) cmd.errors++;
    cmd.lastRun = new Date().toISOString();

    if (!success && error) {
      this.metrics.errors.push({
        command: commandName,
        error,
        timestamp: new Date().toISOString()
      });
    }

    this.metrics.performance.push({
      command: commandName,
      duration,
      success,
      timestamp: Date.now()
    });

    return {
      success: true,
      metric: `${commandName}: ${duration}ms`
    };
  }

  /**
   * Track agent activity
   */
  trackAgent(agentId, action, data = {}) {
    if (!this.metrics.agents[agentId]) {
      this.metrics.agents[agentId] = {
        created: new Date().toISOString(),
        actions: [],
        messageCount: 0,
        lastActive: null
      };
    }

    this.metrics.agents[agentId].actions.push({
      action,
      data,
      timestamp: new Date().toISOString()
    });
    this.metrics.agents[agentId].lastActive = new Date().toISOString();

    return { success: true };
  }

  /**
   * Track channel usage
   */
  trackChannel(channelName, messageCount = 1) {
    if (!this.metrics.channels[channelName]) {
      this.metrics.channels[channelName] = {
        messagesTotal: 0,
        connected: true,
        connectedAt: new Date().toISOString()
      };
    }

    this.metrics.channels[channelName].messagesTotal += messageCount;
    return { success: true };
  }

  /**
   * Get dashboard metrics
   */
  getDashboard() {
    const uptime = Date.now() - this.startTime;
    const commandStats = Object.entries(this.metrics.commands).map(([name, stats]) => ({
      command: name,
      calls: stats.count,
      avgTime: Math.round(stats.totalTime / stats.count),
      errors: stats.errors
    }));

    const topCommands = commandStats.sort((a, b) => b.calls - a.calls).slice(0, 10);

    return {
      uptime: Math.round(uptime / 1000),
      totalCommands: Object.values(this.metrics.commands).reduce((sum, c) => sum + c.count, 0),
      totalErrors: this.metrics.errors.length,
      agents: Object.keys(this.metrics.agents).length,
      channels: Object.keys(this.metrics.channels).length,
      topCommands,
      recentErrors: this.metrics.errors.slice(-5)
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(timeWindowMs = 3600000) {
    const cutoff = Date.now() - timeWindowMs;
    const recent = this.metrics.performance.filter(p => p.timestamp > cutoff);

    const successful = recent.filter(p => p.success).length;
    const failed = recent.filter(p => !p.success).length;
    const avgDuration = recent.length > 0 
      ? Math.round(recent.reduce((sum, p) => sum + p.duration, 0) / recent.length)
      : 0;

    return {
      timeWindow: `${Math.round(timeWindowMs / 1000)}s`,
      total: recent.length,
      successful,
      failed,
      successRate: `${Math.round((successful / recent.length) * 100)}%`,
      avgDuration: `${avgDuration}ms`,
      minDuration: Math.min(...recent.map(p => p.duration)),
      maxDuration: Math.max(...recent.map(p => p.duration))
    };
  }

  /**
   * Get channel statistics
   */
  getChannelStats() {
    return Object.entries(this.metrics.channels).map(([name, stats]) => ({
      channel: name,
      messages: stats.messagesTotal,
      connected: stats.connected,
      connectedAt: stats.connectedAt
    }));
  }

  /**
   * Get agent activity report
   */
  getAgentReport(agentId) {
    const agent = this.metrics.agents[agentId];
    if (!agent) return { success: false, error: 'Agent not found' };

    return {
      agentId,
      created: agent.created,
      lastActive: agent.lastActive,
      actionCount: agent.actions.length,
      actions: agent.actions.slice(-20) // Last 20 actions
    };
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      metrics: this.metrics
    };
  }

  /**
   * Clear old metrics (cleanup)
   */
  cleanup(maxAge = 86400000) {
    const cutoff = Date.now() - maxAge;
    this.metrics.performance = this.metrics.performance.filter(p => p.timestamp > cutoff);
    this.metrics.errors = this.metrics.errors.filter(e => 
      new Date(e.timestamp).getTime() > cutoff
    );
    return { success: true };
  }
}

export default new Analytics();
