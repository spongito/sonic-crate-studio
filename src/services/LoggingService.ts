
// LogLevel enum to categorize logs
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  SUCCESS = 4
}

// Interface for a log entry
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

// Singleton class for centralized logging
export class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];
  private logLevel: LogLevel = LogLevel.INFO; // Default log level
  private maxLogs: number = 1000; // Cap logs to prevent memory issues
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  // Set minimum log level to display
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Add a log entry
  private addLog(level: LogLevel, module: string, message: string, data?: any): void {
    // Only log if level is at or above the current log level
    if (level >= this.logLevel) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level,
        module,
        message,
        data
      };
      
      // Add to internal log storage
      this.logs.unshift(logEntry);
      
      // Truncate if necessary
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }
      
      // Output to console with appropriate formatting
      this.outputToConsole(logEntry);
      
      // Notify any listeners
      this.notifyListeners();
    }
  }

  // Notify log listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  // Subscribe to log updates
  public subscribe(callback: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Output log to console with appropriate styling
  private outputToConsole(log: LogEntry): void {
    const timestamp = log.timestamp.toISOString();
    
    let consoleMethod: 'log' | 'info' | 'warn' | 'error' = 'log';
    let style = '';
    
    switch (log.level) {
      case LogLevel.DEBUG:
        consoleMethod = 'log';
        style = 'color: #6c757d'; // Grey
        break;
      case LogLevel.INFO:
        consoleMethod = 'info';
        style = 'color: #0d6efd'; // Blue
        break;
      case LogLevel.WARNING:
        consoleMethod = 'warn';
        style = 'color: #ffc107'; // Yellow
        break;
      case LogLevel.ERROR:
        consoleMethod = 'error';
        style = 'color: #dc3545'; // Red
        break;
      case LogLevel.SUCCESS:
        consoleMethod = 'log';
        style = 'color: #198754'; // Green
        break;
    }
    
    console[consoleMethod](`%c[${timestamp}] [${LogLevel[log.level]}] [${log.module}]`, style, log.message);
    
    if (log.data !== undefined) {
      console[consoleMethod]('Associated data:', log.data);
    }
  }

  // Clear all logs
  public clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
  }

  // Get all logs
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Filter logs by criteria
  public filterLogs(criteria: {
    level?: LogLevel,
    module?: string,
    since?: Date
  }): LogEntry[] {
    return this.logs.filter(log => {
      if (criteria.level !== undefined && log.level < criteria.level) return false;
      if (criteria.module !== undefined && log.module !== criteria.module) return false;
      if (criteria.since !== undefined && log.timestamp < criteria.since) return false;
      return true;
    });
  }

  // Convenience methods for different log levels
  public debug(module: string, message: string, data?: any): void {
    this.addLog(LogLevel.DEBUG, module, message, data);
  }

  public info(module: string, message: string, data?: any): void {
    this.addLog(LogLevel.INFO, module, message, data);
  }

  public warning(module: string, message: string, data?: any): void {
    this.addLog(LogLevel.WARNING, module, message, data);
  }

  public error(module: string, message: string, data?: any): void {
    this.addLog(LogLevel.ERROR, module, message, data);
  }

  public success(module: string, message: string, data?: any): void {
    this.addLog(LogLevel.SUCCESS, module, message, data);
  }
}

// Export singleton instance
export const logger = LoggingService.getInstance();
