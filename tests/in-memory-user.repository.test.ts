/**
 * Unit Tests: InMemoryUserRepository
 *
 * Simple unit tests for the in-memory repository implementation
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { InMemoryUserRepository } from "@/src/adapters/repositories/in-memory-user.repository";
import type { CreateUserInput } from "@/src/domain/entities/user.entity";

describe("InMemoryUserRepository", () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it("should create a user", async () => {
    const input: CreateUserInput = {
      email: "test@example.com",
      name: "Test User",
    };

    const user = await repository.create(input);

    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test User");
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("should find user by id", async () => {
    const input: CreateUserInput = {
      email: "test@example.com",
      name: "Test User",
    };

    const created = await repository.create(input);
    const found = await repository.findById(String(created.id));

    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.email).toBe("test@example.com");
  });

  it("should find user by email", async () => {
    const input: CreateUserInput = {
      email: "test@example.com",
      name: "Test User",
    };

    await repository.create(input);
    const found = await repository.findByEmail("test@example.com");

    expect(found).not.toBeNull();
    expect(found?.email).toBe("test@example.com");
  });

  it("should return null when user not found", async () => {
    const found = await repository.findById("999");
    expect(found).toBeNull();

    const foundByEmail = await repository.findByEmail(
      "nonexistent@example.com",
    );
    expect(foundByEmail).toBeNull();
  });

  it("should list users", async () => {
    await repository.create({ email: "user1@example.com", name: "User 1" });
    await repository.create({ email: "user2@example.com", name: "User 2" });
    await repository.create({ email: "user3@example.com", name: "User 3" });

    const users = await repository.list();

    expect(users.length).toBe(3);
  });

  it("should list users with limit", async () => {
    await repository.create({ email: "user1@example.com", name: "User 1" });
    await repository.create({ email: "user2@example.com", name: "User 2" });
    await repository.create({ email: "user3@example.com", name: "User 3" });

    const users = await repository.list(2);

    expect(users.length).toBe(2);
  });

  it("should update user", async () => {
    const created = await repository.create({
      email: "test@example.com",
      name: "Test User",
    });

    const updated = await repository.update(String(created.id), {
      name: "Updated Name",
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("Updated Name");
    expect(updated?.email).toBe("test@example.com");
  });

  it("should delete user", async () => {
    const created = await repository.create({
      email: "test@example.com",
      name: "Test User",
    });

    const deleted = await repository.delete(String(created.id));
    expect(deleted).toBe(true);

    const found = await repository.findById(String(created.id));
    expect(found).toBeNull();
  });
});
