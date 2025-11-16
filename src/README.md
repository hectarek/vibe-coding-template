# Clean Architecture Backend

This directory contains the backend code following **Clean Architecture** principles with **Dependency Inversion**.

## 📁 Directory Structure

```
src/
├── domain/                    # Core business logic (innermost layer)
│   ├── entities/             # Domain entities (pure business objects)
│   └── repositories/         # Repository interfaces (ports)
│
├── application/              # Application use cases
│   └── use-cases/           # Business workflows
│
├── adapters/                 # Interface adapters
│   ├── api/                 # Controllers (HTTP handlers)
│   └── repositories/        # Repository implementations (adapters)
│
└── infrastructure/           # Framework & external services
│   ├── api/                 # Framework-specific API setup (Next.js routes)
│
├── di/                      # Dependency injection container
```

## 🏗️ Architecture Layers

### 1. Domain Layer (`domain/`)
**Purpose**: Pure business logic with zero dependencies on frameworks or infrastructure.

- **Entities**: Core business objects (e.g., `User`, `Task`)
- **Repository Ports**: Interfaces defining what operations can be performed (e.g., `UserRepository`)

**Rules**:
- ✅ No imports from `application/`, `adapters/`, or `infrastructure/`
- ✅ Pure TypeScript/JavaScript
- ✅ Framework-independent

### 2. Application Layer (`application/`)
**Purpose**: Use cases that orchestrate domain logic to accomplish business goals.

- **Use Cases**: Single-purpose business workflows (e.g., `CreateUserUseCase`, `GetUserUseCase`)

**Rules**:
- ✅ Can depend on `domain/` layer
- ✅ Depends on repository **interfaces**, not implementations
- ✅ No framework dependencies
- ✅ Easy to unit test (mock repositories)

### 3. Adapters Layer (`adapters/`)
**Purpose**: Bridge between the application core and external world.

- **API Controllers**: Handle HTTP requests/responses, delegate to use cases
- **Repository Implementations**: Concrete implementations of repository ports (e.g., `PostgresUserRepository`, `InMemoryUserRepository`)

**Rules**:
- ✅ Can depend on `application/` and `domain/` layers
- ✅ Implements interfaces defined in `domain/`
- ✅ Framework-agnostic logic (controllers receive plain data, return plain data)

### 4. Infrastructure Layer (`infrastructure/`)
**Purpose**: Framework-specific code and dependency wiring.

- **API Routes**: Next.js route handlers that call controllers
- **Dependency Injection**: Wires up all dependencies

**Rules**:
- ✅ Can depend on all other layers
- ✅ Framework-specific code lives here
- ✅ This is where you swap implementations

## 🔄 Dependency Flow

```
Infrastructure → Adapters → Application → Domain
     ↓              ↓           ↓          ↓
  (outer)       (outer)      (inner)   (innermost)
```

**Key Principle**: Dependencies point **inward**. Inner layers never know about outer layers.

## 📝 Example: Adding a New Feature

Let's say you want to add a "Task" feature:

### Step 1: Define Domain Entity
```typescript
// src/domain/entities/task.entity.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
}
```

### Step 2: Define Repository Port
```typescript
// src/domain/repositories/task.repository.port.ts
export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  // ... other methods
}
```

### Step 3: Create Use Cases
```typescript
// src/application/use-cases/create-task.use-case.ts
export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}
  
  async execute(input: CreateTaskInput): Promise<Task> {
    // Business logic here
    return this.taskRepository.create(input);
  }
}
```

### Step 4: Implement Repository Adapter
```typescript
// src/adapters/repositories/postgres-task.repository.ts
export class PostgresTaskRepository implements TaskRepository {
  constructor(private readonly db: Database) {}
  
  async findById(id: string): Promise<Task | null> {
    // Database-specific code here
  }
}
```

### Step 5: Create Controller
```typescript
// src/adapters/api/task.controller.ts
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    // ... other use cases
  ) {}
  
  async createTask(input: CreateTaskRequest): Promise<TaskResponse> {
    const task = await this.createTaskUseCase.execute(input);
    return this.toTaskResponse(task);
  }
}
```

### Step 6: Wire Up in Container
```typescript
// src/di/container.ts
// Add to Container class:
private taskRepository: TaskRepository;
private createTaskUseCase: CreateTaskUseCase;
private taskController: TaskController;

constructor() {
  // ... existing code ...
  
  this.taskRepository = new PostgresTaskRepository(db);
  this.createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
  this.taskController = new TaskController(this.createTaskUseCase);
}
```

### Step 7: Create Server Action
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

## 🔌 Swapping Implementations

The power of dependency inversion: swap implementations without changing business logic.

### Example: Switch from In-Memory to PostgreSQL

**Before** (in `container.ts`):
```typescript
this.userRepository = new InMemoryUserRepository();
```

**After**:
```typescript
import { PostgresUserRepository } from "@/src/adapters/repositories/postgres-user.repository";

this.userRepository = new PostgresUserRepository(db);
```

**That's it!** No changes needed to:
- Use cases ✅
- Controllers ✅
- Domain entities ✅
- API routes ✅

## 🧪 Testing

### Unit Test a Use Case
```typescript
import { CreateUserUseCase } from "@/src/application/use-cases/create-user.use-case";
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";

// Mock repository
const mockRepository: UserRepository = {
  findByEmail: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue({ id: "1", email: "test@example.com", ... }),
  // ... other methods
};

const useCase = new CreateUserUseCase(mockRepository);
const user = await useCase.execute({ email: "test@example.com", name: "Test" });

expect(user.email).toBe("test@example.com");
```

### Integration Test with In-Memory Repository
```typescript
import { InMemoryUserRepository } from "@/src/adapters/repositories/in-memory-user.repository";
import { CreateUserUseCase } from "@/src/application/use-cases/create-user.use-case";

const repository = new InMemoryUserRepository();
const useCase = new CreateUserUseCase(repository);

const user = await useCase.execute({ email: "test@example.com", name: "Test" });
expect(user.id).toBeDefined();
```

## 📚 Key Principles

1. **Dependency Inversion**: High-level modules (use cases) don't depend on low-level modules (repositories). Both depend on abstractions (interfaces).

2. **Separation of Concerns**: Each layer has a single, well-defined responsibility.

3. **Framework Independence**: Business logic doesn't know about Next.js, Express, or any framework.

4. **Testability**: Easy to test in isolation by mocking dependencies.

5. **Flexibility**: Swap implementations (database, API framework) without changing core logic.

## 🚀 Next Steps

1. **Add Database Repository**: Replace `InMemoryUserRepository` with `PostgresUserRepository` using Drizzle ORM
2. **Add Authentication**: Create auth domain entities and use cases
3. **Add More Features**: Follow the same pattern for new features
4. **Add Validation**: Consider adding Zod schemas for input validation
5. **Add Error Handling**: Create domain-specific error types

## 📖 References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture (Ports & Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)
- Your research document: `docs/architecture-research.md`

