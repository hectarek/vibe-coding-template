/**
 * Not Found Error
 *
 * Thrown when a resource is not found
 */

import { DomainError } from "@/src/domain/errors/base.error";

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";
  override readonly statusCode = 404;

  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404);
  }
}
