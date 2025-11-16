# Authentication Setup Guide

This guide explains how to set up authentication using the generic `AuthService` interface.

## 🔐 Auth Service Pattern

The auth service follows clean architecture - it's a simple interface that can be swapped with any auth provider:

- **NextAuth.js** / **Auth.js**
- **Clerk**
- **Supabase Auth**
- **Custom implementation**

## 📋 AuthService Interface

The `AuthService` interface (`src/domain/services/auth.service.port.ts`) provides:

```typescript
interface AuthService {
  getCurrentUser(): Promise<User | null>;
  getCurrentUserId(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
  requireAuth(): Promise<User>;
}
```

## 🔄 Swapping Auth Providers

### Example: Using NextAuth.js

1. Install NextAuth:
```bash
bun add next-auth
```

2. Create NextAuth implementation:

```typescript
// src/infrastructure/auth/nextauth-auth.service.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { AuthService } from "../../domain/services/auth.service.port";
import type { User } from "../../domain/entities/user.entity";

export class NextAuthService implements AuthService {
  async getCurrentUser(): Promise<User | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    
    // Map NextAuth user to domain User
    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name!,
      createdAt: new Date(), // Get from DB if needed
      updatedAt: new Date(),
    };
  }

  async getCurrentUserId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.id ?? null;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  async requireAuth(): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }
    return user;
  }
}
```

3. Swap in container:

```typescript
// src/di/container.ts
import { NextAuthService } from "../infrastructure/auth/nextauth-auth.service";

constructor() {
  // ... other initialization ...
  this.authService = new NextAuthService(); // Instead of PlaceholderAuthService
}
```

### Example: Using Clerk

```typescript
// src/infrastructure/auth/clerk-auth.service.ts
import { auth } from "@clerk/nextjs/server";
import type { AuthService } from "../../domain/services/auth.service.port";
import type { User } from "../../domain/entities/user.entity";

export class ClerkAuthService implements AuthService {
  async getCurrentUser(): Promise<User | null> {
    const { userId } = await auth();
    if (!userId) return null;
    
    // Fetch user from Clerk or your DB
    // Return domain User entity
  }

  // ... implement other methods
}
```

## 🌐 Using Auth in Server Actions

Server Actions are the recommended pattern for Next.js:

```typescript
// app/actions/users.ts
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
  
  // This throws if not authenticated
  const user = await authService.requireAuth();
  
  // Do something with authenticated user
  return { message: `Hello, ${user.name}!` };
}
```

## 📝 Current Implementation

Currently using `PlaceholderAuthService` which returns `null` for all methods. Replace it when you're ready to add real authentication.

## 🎯 Benefits

- **Swappable**: Change auth providers without touching business logic
- **Testable**: Mock `AuthService` in tests
- **Clean**: Auth details stay in infrastructure layer
- **Simple**: Just 4 methods to implement
