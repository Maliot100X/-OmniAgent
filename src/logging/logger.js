export class Logger {
  constructor(name) {
    this.name = name;
    this.logs = [];
  }

  log(level, message, meta = {}) {
    const entry = {
      timestamp: new Date(),
      level,
      message,
      meta,
      logger: this.name
    };
    this.logs.push(entry);
    console.log(`[${level}] ${this.name}: ${message}`);
    return entry;
  }

  info(msg, meta) { return this.log('INFO', msg, meta); }
  warn(msg, meta) { return this.log('WARN', msg, meta); }
  error(msg, meta) { return this.log('ERROR', msg, meta); }
  debug(msg, meta) { return this.log('DEBUG', msg, meta); }

  getLogs(level = null) {
    return level ? this.logs.filter(l => l.level === level) : this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  export(format = 'json') {
    return format === 'json' ? JSON.stringify(this.logs) : this.logs.map(l => `${l.timestamp} [${l.level}] ${l.message}`).join('\n');
  }
}

export default Logger;
