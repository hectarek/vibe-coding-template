/**
 * Base Error Class
 *
 * Base class for all domain errors
 */

export abstract class DomainError extends Error {
  abstract readonly code: string;
  readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
