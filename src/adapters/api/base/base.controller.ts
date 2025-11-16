/**
 * Base Controller
 *
 * Provides common functionality for all controllers, including logging.
 * Controllers should extend this base class to get consistent logging behavior.
 */

import type { LoggerService } from "@/src/domain/services/logger.service.port";

export type ControllerResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; message: string };

/**
 * Base controller that provides logging and error handling utilities
 */
export class BaseController {
  constructor(protected readonly logger: LoggerService) {}

  /**
   * Execute a controller method with consistent error handling and logging
   */
  protected async execute<T>(
    fn: () => Promise<T>,
  ): Promise<ControllerResponse<T>> {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      const errorName = error instanceof Error ? error.name : "UNKNOWN_ERROR";

      this.logger.error(
        errorMessage,
        error instanceof Error ? error : undefined,
        {
          errorName,
        },
      );

      return {
        success: false,
        error: errorName,
        message: errorMessage,
      };
    }
  }
}
