# Clean Architecture Pattern Guide

This document explains the Clean Architecture pattern used in this codebase and how to maintain consistency when adding new features.

## 🎯 Core Principles

### 1. Dependency Inversion Principle
**High-level modules should not depend on low-level modules. Both should depend on abstractions.**

- Use cases (high-level) depend on repository **interfaces**, not concrete implementations
- Repository implementations (low-level) implement the interfaces defined in the domain layer
- This allows swapping implementations without changing business logic

### 2. Separation of Concerns
**Each layer has a single, well-defined responsibility.**

- **Domain**: Pure business logic, no external dependencies
- **Application**: Orchestrates domain logic into use cases
- **Adapters**: Bridges between application and external world
- **Infrastructure**: Framework-specific code and dependency wiring

### 3. Dependency Rule
**Dependencies point inward. Inner layers never depend on outer layers.**

```
Infrastructure → Adapters → Application → Domain
     ↓              ↓           ↓          ↓
  (outer)       (outer)      (inner)   (innermost)
```

## 📋 Layer Responsibilities

### Domain Layer (`src/domain/`)
**What goes here:**
- Entity definitions (interfaces/types)
- Repository interfaces (ports)
- Domain value objects
- Business rules (pure logic)

**What does NOT go here:**
- ❌ Framework imports (Next.js, Express, etc.)
- ❌ Database-specific code
- ❌ HTTP-specific code
- ❌ External API clients

**Example:**
```typescript
// ✅ Good: Pure domain entity
export interface User {
  id: string;
  email: string;
  name: string;
}

// ✅ Good: Repository interface (port)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
}

// ❌ Bad: Concrete implementation
export class PostgresUserRepository implements UserRepository { ... }
```

### Application Layer (`src/application/`)
**What goes here:**
- Use case classes
- Business workflows
- Input/output DTOs for use cases

**What does NOT go here:**
- ❌ HTTP request/response objects
- ❌ Database connection code
- ❌ Framework-specific code

**Example:**
```typescript
// ✅ Good: Use case depends on interface
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}
  
  async execute(input: CreateUserInput): Promise<User> {
    // Business logic here
  }
}

// ❌ Bad: Use case depends on concrete implementation
export class CreateUserUseCase {
  constructor(private readonly repo: PostgresUserRepository) {}
}
```

### Adapters Layer (`src/adapters/`)
**What goes here:**
- Controllers (receive plain data, return plain data)
- Repository implementations (Postgres, MongoDB, In-Memory, etc.)
- External service adapters

**Rules:**
- Controllers should be framework-agnostic in their logic
- They transform between HTTP format and domain format
- Repository implementations implement domain interfaces

**Example:**
```typescript
// ✅ Good: Controller receives plain data
export class UserController {
  async createUser(input: CreateUserRequest): Promise<UserResponse> {
    const user = await this.createUserUseCase.execute(input);
    return this.toUserResponse(user);
  }
}

// ❌ Bad: Controller receives HTTP request object
export class UserController {
  async createUser(req: NextRequest): Promise<Response> {
    // This couples controller to Next.js
  }
}
```

### Infrastructure Layer (`src/infrastructure/`)
**What goes here:**
- Dependency injection container
- Framework-specific route handlers
- Database connection setup
- External service configurations

**Example:**
```typescript
// ✅ Good: Route handler wires up dependencies
export async function POST(request: NextRequest) {
  const container = getContainer();
  const controller = container.getUserController();
  const body = await request.json();
  const result = await controller.createUser(body);
  return Response.json(result);
}
```

## 🔄 Adding a New Feature: Step-by-Step

### Example: Adding a "Task" Feature

#### Step 1: Domain Entity
```typescript
// src/domain/entities/task.entity.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
}

export interface CreateTaskInput {
  title: string;
  userId: string;
}
```

#### Step 2: Repository Port
```typescript
// src/domain/repositories/task.repository.port.ts
import type { Task, CreateTaskInput } from "../entities/task.entity";

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, updates: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<Task[]>;
}
```

#### Step 3: Use Cases
```typescript
// src/application/use-cases/create-task.use-case.ts
import type { Task, CreateTaskInput } from "../../domain/entities/task.entity";
import type { TaskRepository } from "../../domain/repositories/task.repository.port";

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}
  
  async execute(input: CreateTaskInput): Promise<Task> {
    // Business rules
    if (!input.title.trim()) {
      throw new Error("Task title cannot be empty");
    }
    
    return this.taskRepository.create(input);
  }
}
```

#### Step 4: Repository Implementation
```typescript
// src/adapters/repositories/in-memory-task.repository.ts
import type { Task, CreateTaskInput } from "../../domain/entities/task.entity";
import type { TaskRepository } from "../../domain/repositories/task.repository.port";

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();
  
  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }
  
  async create(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      ...input,
      completed: false,
      createdAt: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }
  
  // ... implement other methods
}
```

#### Step 5: Controller
```typescript
// src/adapters/api/task.controller.ts
import { CreateTaskUseCase } from "../../application/use-cases/create-task.use-case";
import type { CreateTaskInput } from "../../domain/entities/task.entity";

export interface CreateTaskRequest {
  title: string;
  userId: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    // ... other use cases
  ) {}
  
  async createTask(input: CreateTaskRequest): Promise<TaskResponse | ErrorResponse> {
    try {
      const task = await this.createTaskUseCase.execute(input);
      return this.toTaskResponse(task);
    } catch (error) {
      return {
        error: "CREATE_TASK_ERROR",
        message: error instanceof Error ? error.message : "Failed to create task",
      };
    }
  }
  
  private toTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt.toISOString(),
    };
  }
}
```

#### Step 6: Wire Up in Container
```typescript
// src/di/container.ts
export class Container {
  // ... existing properties ...
  
  private taskRepository: TaskRepository;
  private createTaskUseCase: CreateTaskUseCase;
  private taskController: TaskController;
  
  constructor() {
    // ... existing initialization ...
    
    // Initialize task dependencies
    this.taskRepository = new InMemoryTaskRepository();
    this.createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    this.taskController = new TaskController(this.createTaskUseCase);
  }
  
  getTaskController(): TaskController {
    return this.taskController;
  }
}
```

#### Step 7: Create Server Action
```typescript
// app/actions/tasks.ts
"use server";

import { getContainer } from "@/src/di/container";
import { revalidatePath } from "next/cache";

export async function createTask(input: CreateTaskRequest) {
  const container = getContainer();
  const controller = container.getTaskController();
  const result = await controller.createTask(input);
  
  if ("error" in result) {
    throw new Error(result.message);
  }
  
  revalidatePath("/tasks");
  return result;
}
```

## ✅ Checklist for New Features

When adding a new feature, ensure:

- [ ] Domain entity defined in `src/domain/entities/`
- [ ] Repository interface (port) defined in `src/domain/repositories/`
- [ ] Use cases created in `src/application/use-cases/`
- [ ] Repository implementation in `src/adapters/repositories/`
- [ ] Controller in `src/adapters/api/`
- [ ] Dependencies wired up in `container.ts`
- [ ] API route created in `app/api/`
- [ ] No circular dependencies
- [ ] Domain layer has no external dependencies
- [ ] Use cases depend on interfaces, not implementations

## 🚫 Common Mistakes to Avoid

### ❌ Mistake 1: Passing HTTP objects to use cases
```typescript
// ❌ Bad
class CreateUserUseCase {
  async execute(req: NextRequest): Promise<User> {
    const body = await req.json();
    // ...
  }
}

// ✅ Good
class CreateUserUseCase {
  async execute(input: CreateUserInput): Promise<User> {
    // ...
  }
}
```

### ❌ Mistake 2: Domain layer importing from adapters
```typescript
// ❌ Bad: Domain importing adapter
import { PostgresUserRepository } from "../../adapters/repositories/postgres-user.repository";

// ✅ Good: Domain only defines interfaces
export interface UserRepository {
  findById(id: string): Promise<User | null>;
}
```

### ❌ Mistake 3: Business logic in controllers
```typescript
// ❌ Bad: Business logic in controller
class UserController {
  async createUser(input: CreateUserRequest) {
    if (!input.email.includes("@")) {
      throw new Error("Invalid email");
    }
    // ...
  }
}

// ✅ Good: Business logic in use case
class CreateUserUseCase {
  async execute(input: CreateUserInput) {
    if (!this.isValidEmail(input.email)) {
      throw new Error("Invalid email");
    }
    // ...
  }
}
```

### ❌ Mistake 4: Use case depending on concrete implementation
```typescript
// ❌ Bad
class CreateUserUseCase {
  constructor(private readonly repo: PostgresUserRepository) {}
}

// ✅ Good
class CreateUserUseCase {
  constructor(private readonly repo: UserRepository) {}
}
```

## 🔍 Testing Strategy

### Unit Test Use Cases
```typescript
import { CreateUserUseCase } from "@/src/application/use-cases/create-user.use-case";

const mockRepository: UserRepository = {
  findByEmail: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue({ id: "1", email: "test@example.com", ... }),
  // ...
};

const useCase = new CreateUserUseCase(mockRepository);
const user = await useCase.execute({ email: "test@example.com", name: "Test" });
```

### Integration Test with In-Memory Repository
```typescript
import { InMemoryUserRepository } from "@/src/adapters/repositories/in-memory-user.repository";

const repository = new InMemoryUserRepository();
const useCase = new CreateUserUseCase(repository);
// Test use case with real (in-memory) repository
```

## 📚 Further Reading

- See `src/README.md` for detailed architecture explanation
- Your research document for Clean Architecture principles
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

