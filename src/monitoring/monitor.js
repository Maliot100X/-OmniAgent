export class SystemMonitor {
  constructor() {
    this.metrics = {
      uptime: 0,
      commandsExecuted: 0,
      errorsCount: 0,
      avgResponseTime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      connectedPlatforms: 0
    };
    this.history = [];
    this.alerts = [];
  }

  recordMetric(name, value) {
    this.metrics[name] = value;
    this.history.push({ timestamp: new Date(), metric: name, value });
  }

  getMetrics() {
    return this.metrics;
  }

  getHistory(limit = 100) {
    return this.history.slice(-limit);
  }

  createAlert(level, title, message) {
    const alert = {
      id: 'alert_' + Date.now(),
      level,
      title,
      message,
      timestamp: new Date()
    };
    this.alerts.push(alert);
    return alert;
  }

  getAlerts(level = null) {
    return level ? this.alerts.filter(a => a.level === level) : this.alerts;
  }

  clearAlerts() {
    this.alerts = [];
  }

  getHealthStatus() {
    const errors = this.metrics.errorsCount;
    if (errors > 10) return 'critical';
    if (errors > 5) return 'warning';
    return 'healthy';
  }
}

export default SystemMonitor;
