/**
 * Example Server Actions Pattern
 *
 * Server Actions are a cleaner pattern for Next.js than API routes.
 * They're type-safe, can be called directly from components, and
 * automatically handle serialization.
 *
 * To use:
 * 1. Create app/actions/users.ts (or similar)
 * 2. Copy the action functions below
 * 3. Mark functions with "use server" directive
 * 4. Import and use in components
 */

"use server";

import { revalidatePath } from "next/cache";
import { getContainer } from "@/src/di/container";

/**
 * Server Action: Create User
 *
 * Can be called directly from a form or component:
 *
 * ```tsx
 * import { createUser } from "@/app/actions/users";
 *
 * async function handleSubmit(formData: FormData) {
 *   await createUser({
 *     email: formData.get("email") as string,
 *     name: formData.get("name") as string,
 *   });
 * }
 * ```
 */
export async function createUser(input: { email: string; name: string }) {
  const container = getContainer();
  const controller = container.getUserController();

  const result = await controller.createUser(input);

  if ("error" in result) {
    throw new Error(result.message);
  }

  // Revalidate any pages that show user lists
  revalidatePath("/users");

  return result;
}

/**
 * Server Action: Get User
 */
export async function getUser(id: string) {
  const container = getContainer();
  const controller = container.getUserController();

  const result = await controller.getUserById(id);

  if ("error" in result) {
    throw new Error(result.message);
  }

  return result;
}

/**
 * Server Action: List Users
 */
export async function listUsers(options?: { limit?: number; offset?: number }) {
  const container = getContainer();
  const controller = container.getUserController();

  const result = await controller.listUsers(options?.limit, options?.offset);

  if ("error" in result) {
    throw new Error(result.message);
  }

  return result;
}

/**
 * Server Action: Get Current User (with auth)
 *
 * Example of using auth service in a server action:
 */
export async function getCurrentUser() {
  const container = getContainer();
  const authService = container.getAuthService();

  try {
    const user = await authService.getCurrentUser();
    return user;
  } catch (_error) {
    return null;
  }
}

/**
 * Server Action: Protected Action Example
 *
 * Shows how to require authentication in a server action:
 */
export async function protectedAction() {
  const container = getContainer();
  const authService = container.getAuthService();

  // This will throw if not authenticated
  const user = await authService.requireAuth();

  // Do something with authenticated user
  return {
    message: `Hello, ${user.name}!`,
    userId: user.id,
  };
}
