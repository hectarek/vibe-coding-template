/**
 * Use Case: GetUser
 *
 * Simple use case for retrieving a user by ID.
 * Demonstrates how use cases orchestrate domain logic.
 */

import type { User } from "@/src/domain/entities/user.entity";
import { NotFoundError } from "@/src/domain/errors/not-found.error";
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";

export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Execute the use case: Get a user by ID
   *
   * @throws NotFoundError if user not found
   */
  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User", id);
    }

    return user;
  }
}
