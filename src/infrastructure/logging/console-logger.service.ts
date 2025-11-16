/**
 * Console Logger Service Implementation
 *
 * Provides structured logging to console with color-coded output.
 * In production, you might want to integrate with services like Winston, Pino, or external logging services.
 */

import type {
  LogContext,
  LoggerService,
} from "@/src/domain/services/logger.service.port";
import { getEnv } from "@/src/shared/config/env";

type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export class ConsoleLoggerService implements LoggerService {
  private readonly logLevel: number;

  constructor(logLevel?: number) {
    // Use provided log level or get from env
    this.logLevel = logLevel ?? getEnv().APP_LOG_LEVEL;
  }

  trace(message: string, context?: LogContext): void {
    if (this.logLevel > 0) return;
    this.log("trace", message, undefined, context);
  }

  debug(message: string, context?: LogContext): void {
    if (this.logLevel > 1) return;
    this.log("debug", message, undefined, context);
  }

  info(message: string, context?: LogContext): void {
    if (this.logLevel > 2) return;
    this.log("info", message, undefined, context);
  }

  warn(message: string, context?: LogContext): void {
    if (this.logLevel > 3) return;
    this.log("warn", message, undefined, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.logLevel > 4) return;
    this.log("error", message, error, context);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    if (this.logLevel > 4) return;
    this.log("fatal", message, error, context);
  }

  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext,
  ): void {
    const timestamp = new Date().toISOString();

    const colors = {
      info: "\x1b[36m", // Cyan
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      fatal: "\x1b[38;5;208m", // Orange
      debug: "\x1b[94m", // Bright Blue
      trace: "\x1b[90m", // Gray
    };

    const reset = "\x1b[0m";
    const color = colors[level] ?? "";

    const levelNumber = this.levelToNumber(level);
    const prefix = `${color}[${timestamp}] ${level.toUpperCase()}-${levelNumber}${reset}`;
    const line = `${prefix} ${message}`;

    console.log(line);

    // Always print raw context and error details if provided
    if (context && Object.keys(context).length > 0) {
      console.log("Context:", context);
    }

    if (error) {
      console.log("Error Details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
  }

  private levelToNumber(level: LogLevel): number {
    switch (level) {
      case "trace":
        return 0;
      case "debug":
        return 1;
      case "info":
        return 2;
      case "warn":
        return 3;
      case "error":
      case "fatal":
        return 4;
      default:
        return 2;
    }
  }
}
