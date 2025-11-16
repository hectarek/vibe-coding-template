/**
 * Use Case: ListUsers
 *
 * Use case for listing users with pagination.
 */

import type { User } from "@/src/domain/entities/user.entity";
import { ValidationError } from "@/src/domain/errors/validation.error";
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";

export interface ListUsersInput {
  limit?: number;
  offset?: number;
}

export interface ListUsersResult {
  users: User[];
  total: number;
}

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Execute the use case: List users with pagination
   */
  async execute(input: ListUsersInput = {}): Promise<ListUsersResult> {
    const limit = input.limit ?? 10;
    const offset = input.offset ?? 0;

    // Business rule: Limit must be reasonable
    if (limit < 1 || limit > 100) {
      throw new ValidationError("Limit must be between 1 and 100", [
        {
          code: "custom",
          path: ["limit"],
          message: "Limit must be between 1 and 100",
        },
      ]);
    }

    const users = await this.userRepository.list(limit, offset);

    // Note: In a real implementation, you might want to get total count
    // from the repository. For simplicity, we're just returning the list.
    return {
      users,
      total: users.length,
    };
  }
}
