/**
 * Validation Error
 *
 * Thrown when input validation fails
 */

import type { ZodError } from "zod";
import { DomainError } from "@/src/domain/errors/base.error";

export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";
  override readonly statusCode = 400;
  readonly errors: ZodError["issues"];

  constructor(message: string, errors: ZodError["issues"]) {
    super(message, 400);
    this.errors = errors;
  }
}
