/**
 * Server Actions: Users
 *
 * Server Actions for user-related operations.
 * These bridge the UI layer to the backend controllers.
 */

"use server";

import { revalidatePath } from "next/cache";
import type {
  CreateUserRequest,
  UserResponse,
} from "@/src/adapters/api/user.controller";
import { getContainer } from "@/src/di/container";

/**
 * Create a new user
 */
export async function createUserAction(
  input: CreateUserRequest,
): Promise<UserResponse> {
  const container = getContainer();
  const controller = container.getUserController();

  const result = await controller.createUser(input);

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath("/users");
  return result.data;
}

/**
 * Get a user by ID
 */
export async function getUserAction(id: string): Promise<UserResponse> {
  const container = getContainer();
  const controller = container.getUserController();

  const result = await controller.getUserById(id);

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

/**
 * List users with pagination
 */
export async function listUsersAction(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ users: UserResponse[]; total: number }> {
  const container = getContainer();
  const controller = container.getUserController();

  const result = await controller.listUsers(options?.limit, options?.offset);

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUserAction(): Promise<UserResponse | null> {
  const container = getContainer();
  const authService = container.getAuthService();

  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return null;
    }

    // Convert domain User to UserResponse DTO
    return {
      id: String(user.id),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}
