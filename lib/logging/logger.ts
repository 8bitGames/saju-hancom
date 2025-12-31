/**
 * Structured Logging Utility
 * Production-ready logging with context and log levels
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (): LogLevel => {
  if (process.env.NODE_ENV === "development") return "debug";
  return (process.env.LOG_LEVEL as LogLevel) || "info";
};

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel()];
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === "development") {
    // Pretty print in development
    const ctx = entry.context ? ` | ${JSON.stringify(entry.context)}` : "";
    const err = entry.error ? ` | Error: ${entry.error.message}` : "";
    return `[${entry.level.toUpperCase()}] ${entry.message}${ctx}${err}`;
  }
  // JSON format for production
  return JSON.stringify(entry);
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, context, error);
  const formattedLog = formatLog(entry);

  switch (level) {
    case "debug":
      console.debug(formattedLog);
      break;
    case "info":
      console.info(formattedLog);
      break;
    case "warn":
      console.warn(formattedLog);
      break;
    case "error":
      console.error(formattedLog);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, error?: Error, context?: LogContext) =>
    log("error", message, context, error),

  /**
   * Create a child logger with preset context
   */
  child: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      log("debug", message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log("info", message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log("warn", message, { ...baseContext, ...context }),
    error: (message: string, error?: Error, context?: LogContext) =>
      log("error", message, { ...baseContext, ...context }, error),
  }),

  /**
   * Log API request with timing
   */
  apiRequest: (
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) => {
    const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    log(level, `${method} ${path} ${statusCode}`, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    });
  },

  /**
   * Log performance metric
   */
  metric: (name: string, value: number, unit: string, context?: LogContext) => {
    log("info", `metric:${name}`, {
      ...context,
      metricName: name,
      metricValue: value,
      metricUnit: unit,
    });
  },
};

/**
 * Performance timing utility
 */
export function createTimer() {
  const start = performance.now();
  return {
    elapsed: () => Math.round(performance.now() - start),
    log: (message: string, context?: LogContext) => {
      const duration = Math.round(performance.now() - start);
      logger.info(message, { ...context, duration });
      return duration;
    },
  };
}
