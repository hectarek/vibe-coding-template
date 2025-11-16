# Frontend Data Flow Pattern

This document defines the data flow pattern for Next.js App Router with Server Actions and Clean Architecture.

## Data Flow Architecture

```
Components -> Page (Server Component) -> Server Action -> Controller -> Use Case -> Repository
```

**The UI should never directly reach into application layers**

## Page & Server Components (`app/*/page.tsx`)

```typescript
// Pages are the ONLY place that should call Server Actions to fetch initial data
import { getUserProfileAction } from '@/app/actions/users'
import { UserProfileCard } from '@/app/_components/profile/user-profile-card'

export default async function ProfilePage() {
  // 1. Page fetches data via Server Action
  const userProfile = await getUserProfileAction()

  // 2. Page passes data down to client components
  return <UserProfileCard user={userProfile} />
}
```

### Page Responsibilities

- **Fetch Initial Data**: Only place to call Server Actions for initial data
- **Compose UI**: Assemble page by rendering client components
- **Pass Data Down**: Provide data to client components via props

### What Pages Should NOT Do

- ❌ Handle user interactions (clicks, form submissions)
- ❌ Contain complex state management
- ❌ Call controllers or use cases directly
- ❌ Call Server Actions from client components (only for initial data)

## Server Actions (`app/actions/*.ts`)

```typescript
'use server'

import { getContainer } from '@/src/di/container'
import { revalidatePath } from 'next/cache'

export async function getUserProfileAction() {
  // 1. Get controller from DI container
  const container = getContainer()
  const controller = container.getUserController()
  
  // 2. Call controller method
  const response = await controller.getUserById(userId)

  // 3. Handle controller errors
  if ('error' in response) {
    throw new Error(response.message)
  }

  // 4. Return DTO (controller already converts entity to DTO)
  return response
}

export async function createUserAction(input: { email: string; name: string }) {
  const container = getContainer()
  const controller = container.getUserController()
  
  const response = await controller.createUser(input)
  
  if ('error' in response) {
    throw new Error(response.message)
  }
  
  // Revalidate after mutation
  revalidatePath('/users')
  
  return response
}
```

### Server Action Responsibilities

- **Bridge UI to Backend**: Single entry point from UI to application layer
- **Call Controllers**: Primary job is calling controller methods from DI container
- **Handle Controller Errors**: Convert backend errors to UI-appropriate responses
- **Revalidate Cache**: Update Next.js cache after mutations

### Server Action Rules

1. **Always use 'use server' directive** at the top of the file
2. **Get controllers from `getContainer()`** - never instantiate directly
3. **Handle ControllerResponse success/error states** - controllers return `Response | ErrorResponse`
4. **Throw errors for UI** - Server Actions handle thrown errors automatically
5. **Revalidate after mutations** - Use `revalidatePath()` or `revalidateTag()`
6. **Never contain business logic** - Delegate everything to controllers

## Client Components (`app/_components/**/*.tsx`)

```typescript
'use client'

import { useState, useTransition } from 'react'
import { createUserAction } from '@/app/actions/users'
import type { UserResponse } from '@/src/adapters/api/user.controller'

interface UserProfileCardProps {
  user: UserResponse | null
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const [isPending, startTransition] = useTransition()
  
  if (!user) return <div>User not found.</div>

  // Component only renders data it was given
  // All state changes handled here via useState/useTransition
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### Client Component Responsibilities

- **Handle User Interaction**: Manage all user events (onClick, onChange, etc.)
- **Manage UI State**: Use `useState` and `useTransition` for client-side state
- **Receive Data via Props**: Are "dumb" components that receive data from parents
- **Call Server Actions for Mutations**: Can call Server Actions for form submissions and mutations

### What Client Components Should NOT Do

- ❌ Call Server Actions to fetch their own initial data (page's job)
- ❌ Access controllers or use cases directly
- ❌ Contain business logic
- ❌ Import from `src/application/` or `src/domain/` layers

## Data Flow Rules

### ✅ Good: Page fetches, component receives

```typescript
// app/users/page.tsx
import { listUsersAction } from '@/app/actions/users'
import { UsersList } from '@/app/_components/users/users-list'

export default async function UsersPage() {
  const users = await listUsersAction()
  return <UsersList users={users} />
}

// app/_components/users/users-list.tsx
'use client'
export function UsersList({ users }: { users: UserResponse[] }) {
  return <div>{/* Render users */}</div>
}
```

### ❌ Bad: Component fetches its own data

```typescript
// ❌ Don't do this
'use client'
export function UsersList() {
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    listUsersAction().then(setUsers) // ❌ Component fetching data
  }, [])
  
  return <div>{/* Render users */}</div>
}
```

### ✅ Good: Component calls Server Action for mutations

```typescript
'use client'
export function UserForm() {
  const [isPending, startTransition] = useTransition()
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createUserAction({
        email: formData.get('email') as string,
        name: formData.get('name') as string,
      })
    })
  }
  
  return <form action={handleSubmit}>{/* Form fields */}</form>
}
```

### Authentication Pattern

```typescript
// In Server Actions - authentication handled at controller level
export async function getCurrentUserAction() {
  const container = getContainer()
  const controller = container.getUserController()
  
  // Controller handles authentication internally via AuthService
  const response = await controller.getCurrentUser()
  
  if ('error' in response) {
    if (response.error === 'AUTHENTICATION_ERROR') {
      // Handle auth error
      return null
    }
    throw new Error(response.message)
  }
  
  return response
}
```

### Form Handling Pattern

```typescript
// Client component handles form state
'use client'
import { useTransition } from 'react'
import { updateUserAction } from '@/app/actions/users'

export function UserForm({ user }: { user: UserResponse }) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateUserAction({
          id: user.id,
          name: formData.get('name') as string,
        })
      } catch (error) {
        // Handle error (toast, etc.)
        console.error(error)
      }
    })
  }

  return (
    <form action={handleSubmit}>
      <input name="name" defaultValue={user.name} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

## Architecture Benefits

1. **Clear Separation**: UI concerns separate from business logic
2. **Type Safety**: Controllers return typed DTOs
3. **Server-Side Auth**: Authentication handled at controller level
4. **Predictable Flow**: One-way data flow from pages down to components
5. **Testable**: Each layer can be tested independently
6. **Maintainable**: Changes to business logic don't affect UI code

## Common Patterns

### Loading States

```typescript
// Page handles loading
export default async function UsersPage() {
  const users = await listUsersAction()
  return <UsersList users={users} />
}

// Or use Suspense boundaries
export default function UsersPage() {
  return (
    <Suspense fallback={<UsersListSkeleton />}>
      <UsersListContent />
    </Suspense>
  )
}

async function UsersListContent() {
  const users = await listUsersAction()
  return <UsersList users={users} />
}
```

### Error Handling

```typescript
// Server Action throws errors
export async function getUserAction(id: string) {
  const container = getContainer()
  const controller = container.getUserController()
  const response = await controller.getUserById(id)
  
  if ('error' in response) {
    throw new Error(response.message) // Server Actions handle this
  }
  
  return response
}

// Component catches errors
'use client'
export function UserProfile({ userId }: { userId: string }) {
  const [error, setError] = useState<string | null>(null)
  
  const handleLoad = async () => {
    try {
      const user = await getUserAction(userId)
      // Handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
    }
  }
  
  return error ? <div>Error: {error}</div> : <div>{/* User content */}</div>
}
```

## Violations to Avoid

1. ❌ Client components importing from `src/application/` or `src/domain/`
2. ❌ Client components calling controllers directly
3. ❌ Server Actions containing business logic
4. ❌ Pages handling user interactions
5. ❌ Components fetching their own initial data

