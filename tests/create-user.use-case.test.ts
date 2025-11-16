/**
 * Unit Tests: CreateUserUseCase
 *
 * Simple unit tests using Bun's built-in test runner
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { CreateUserUseCase } from "@/src/application/use-cases/create-user.use-case";
import type { CreateUserInput, User } from "@/src/domain/entities/user.entity";
import { ValidationError } from "@/src/domain/errors/validation.error";
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let mockRepository: UserRepository;

  beforeEach(() => {
    // Create a mock repository
    mockRepository = {
      findByEmail: async () => null,
      create: async (input: CreateUserInput): Promise<User> => ({
        id: 1,
        email: input.email,
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findById: async () => null,
      update: async () => null,
      delete: async () => false,
      list: async () => [],
    };

    useCase = new CreateUserUseCase(mockRepository);
  });

  it("should create a user with valid input", async () => {
    const input: CreateUserInput = {
      email: "test@example.com",
      name: "Test User",
    };

    const user = await useCase.execute(input);

    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test User");
    expect(user.id).toBe(1);
  });

  it("should throw ValidationError for invalid email", async () => {
    const input = {
      email: "invalid-email",
      name: "Test User",
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError for empty name", async () => {
    const input = {
      email: "test@example.com",
      name: "",
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError for missing email", async () => {
    const input = {
      name: "Test User",
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
  });

  it("should throw error if email already exists", async () => {
    const existingUser: User = {
      id: 1,
      email: "existing@example.com",
      name: "Existing User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findByEmail = async () => existingUser;

    const input: CreateUserInput = {
      email: "existing@example.com",
      name: "New User",
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      "User with this email already exists",
    );
  });

  it("should normalize email to lowercase", async () => {
    const input: CreateUserInput = {
      email: "TEST@EXAMPLE.COM",
      name: "Test User",
    };

    const user = await useCase.execute(input);

    expect(user.email).toBe("test@example.com");
  });

  it("should trim whitespace from name", async () => {
    const input: CreateUserInput = {
      email: "test@example.com",
      name: "  Test User  ",
    };

    const user = await useCase.execute(input);

    expect(user.name).toBe("Test User");
  });
});
