/**
 * Port (Interface): LoggerService
 *
 * Generic logging service interface that can be swapped out
 * with any logging provider (Winston, Pino, external services, etc.)
 *
 * This keeps logging implementation details out of the domain layer.
 */

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerService {
  /**
   * Log a trace message (level 0)
   */
  trace(message: string, context?: LogContext): void;

  /**
   * Log a debug message (level 1)
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Log an info message (level 2)
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log a warning message (level 3)
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log an error message (level 4)
   */
  error(message: string, error?: Error, context?: LogContext): void;

  /**
   * Log a fatal error message (level 4)
   */
  fatal(message: string, error?: Error, context?: LogContext): void;
}
