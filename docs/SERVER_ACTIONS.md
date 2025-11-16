# Server Actions Pattern

This project uses **Next.js Server Actions** instead of API routes for a cleaner, type-safe approach.

> **📖 See also:** [Frontend Data Flow Pattern](./FRONTEND_DATA_FLOW.md) for complete data flow architecture

## 🎯 Why Server Actions?

- **Type-safe**: Full TypeScript support, no manual serialization
- **Simpler**: Call directly from components, no fetch needed
- **Better DX**: Automatic error handling and loading states
- **Cleaner**: No need for separate API route files

## 📝 Creating Server Actions

### Basic Pattern

```typescript
// app/actions/users.ts
"use server";

import { getContainer } from "@/src/di/container";

export async function createUser(input: { email: string; name: string }) {
  const container = getContainer();
  const controller = container.getUserController();
  
  const result = await controller.createUser(input);
  
  if ("error" in result) {
    throw new Error(result.message);
  }
  
  return result;
}
```

### Using in Components

```typescript
// app/components/user-form.tsx
"use client";

import { createUser } from "@/app/actions/users";
import { useTransition } from "react";

export function UserForm() {
  const [isPending, startTransition] = useTransition();
  
  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const user = await createUser({
          email: formData.get("email") as string,
          name: formData.get("name") as string,
        });
        console.log("User created:", user);
      } catch (error) {
        console.error(error);
      }
    });
  }
  
  return (
    <form action={handleSubmit}>
      <input name="email" type="email" />
      <input name="name" type="text" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

### With Authentication

```typescript
// app/actions/protected.ts
"use server";

import { getContainer } from "@/src/di/container";

export async function getCurrentUser() {
  const container = getContainer();
  const authService = container.getAuthService();
  
  return await authService.getCurrentUser();
}

export async function protectedAction() {
  const container = getContainer();
  const authService = container.getAuthService();
  
  // Throws if not authenticated
  const user = await authService.requireAuth();
  
  return { message: `Hello, ${user.name}!` };
}
```

## 🔄 Revalidation

Use `revalidatePath` or `revalidateTag` to update cached data:

```typescript
import { revalidatePath } from "next/cache";

export async function createUser(input: { email: string; name: string }) {
  // ... create user ...
  
  revalidatePath("/users"); // Revalidate users page
  // or
  revalidateTag("users"); // If using fetch with tags
}
```

## 📚 Example Actions

See `src/infrastructure/api/server-actions.example.ts` for complete examples.

## ✅ Best Practices

1. **Always use "use server"** directive at the top of action files
2. **Get controllers from DI container** - Use `getContainer()`, never instantiate directly
3. **Handle errors** - Throw errors (Server Actions handle them automatically)
4. **Revalidate** - Update cache after mutations using `revalidatePath()` or `revalidateTag()`
5. **Type inputs** - Use TypeScript interfaces for inputs
6. **Keep actions thin** - Delegate everything to controllers, no business logic

## Architecture Integration

Server Actions are part of the frontend data flow pattern:

```
Page (Server Component) -> Server Action -> Controller -> Use Case -> Repository
```

- **Pages** call Server Actions to fetch initial data
- **Server Actions** call controllers from DI container
- **Controllers** handle business logic via use cases
- **Client Components** receive data via props and call Server Actions for mutations

See [Frontend Data Flow Pattern](./FRONTEND_DATA_FLOW.md) for complete details.

