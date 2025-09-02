export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  userEmail?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      userEmail: this.getCurrentUserEmail(),
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      const state = JSON.parse(localStorage.getItem('persist:root') || '{}');
      const auth = JSON.parse(state.auth || '{}');
      return auth.user?.id;
    } catch {
      return undefined;
    }
  }

  private getCurrentUserEmail(): string | undefined {
    try {
      const state = JSON.parse(localStorage.getItem('persist:root') || '{}');
      const auth = JSON.parse(state.auth || '{}');
      return auth.user?.email;
    } catch {
      return undefined;
    }
  }

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Also log to console for development
    const consoleFn = console[entry.level] || console.log;
    consoleFn(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.context || '');
  }

  debug(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, context);
    this.addLog(entry);
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, context);
    this.addLog(entry);
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, context);
    this.addLog(entry);
  }

  error(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('error', message, context);
    this.addLog(entry);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared');
  }
}

export const logger = new Logger();