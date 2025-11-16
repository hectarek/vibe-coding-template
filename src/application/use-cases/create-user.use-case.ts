/**
 * Use Case: CreateUser
 *
 * This is an APPLICATION LAYER use case. It contains business logic
 * for creating a user, but depends only on the domain repository interface,
 * not concrete implementations.
 *
 * This use case can be tested in isolation by mocking the UserRepository.
 */

import type { User } from "@/src/domain/entities/user.entity";
import { createUserInputSchema } from "@/src/domain/entities/user.entity";
import { ValidationError } from "@/src/domain/errors/validation.error";
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Execute the use case: Create a new user
   *
   * Business rules:
   * - Email must be unique
   * - Input must be valid (validated by Zod schema)
   *
   * @throws ValidationError if input is invalid
   * @throws Error if email already exists
   */
  async execute(input: unknown): Promise<User> {
    // Validate input with Zod schema
    const validationResult = createUserInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", validationResult.error.issues);
    }

    const validatedInput = validationResult.data;

    // Business rule: Check if email already exists
    const existingUser = await this.userRepository.findByEmail(
      validatedInput.email,
    );
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create the user through the repository
    // Zod schema already handles trimming and normalization
    const user = await this.userRepository.create({
      email: validatedInput.email.toLowerCase(),
      name: validatedInput.name,
    });

    return user;
  }
}
