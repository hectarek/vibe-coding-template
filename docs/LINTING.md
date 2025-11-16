# Linting Rules for Clean Architecture

This project uses Biome and custom scripts to enforce Clean Architecture principles and consistent import patterns.

## Overview

We enforce two main rules:
1. **All imports must use `@/src/*` instead of relative paths**
2. **Clean Architecture layer boundaries must be respected**

## Rules

### 1. Import Path Rules

**❌ Forbidden:**
```typescript
import { User } from "../../domain/entities/user.entity";
import { User } from "../entities/user.entity";
import { User } from "./user.entity";
```

**✅ Required:**
```typescript
import { User } from "@/src/domain/entities/user.entity";
import { User } from "@/src/domain/entities/user.entity";
import { User } from "@/src/domain/entities/user.entity";
```

### 2. Layer Boundary Rules

#### Domain Layer (`src/domain/**`)
- ❌ **Cannot** import from: `application/`, `adapters/`, `infrastructure/`
- ✅ **Can** import from: `domain/` (itself), external packages

#### Application Layer (`src/application/**`)
- ❌ **Cannot** import from: `adapters/`, `infrastructure/`
- ✅ **Can** import from: `domain/`, `application/` (itself)

#### Adapters Layer (`src/adapters/**`)
- ❌ **Cannot** import from: `infrastructure/`
- ✅ **Can** import from: `domain/`, `application/`, `adapters/` (itself)

#### Infrastructure Layer (`src/infrastructure/**`, `src/di/**`)
- ✅ **Can** import from: Any layer
- Must still use `@/src/*` imports

## How to Check

### Using Biome (Automatic)
```bash
bun run lint
```

Biome will automatically format and check your code. However, Biome's `noRestrictedImports` rule may not catch all violations, so we also use a custom script.

### Using Biome (Recommended)
Biome automatically checks for:
- Relative imports (enforced via `noRestrictedImports`)
- Layer boundary violations
- Import path consistency

## Fixing Violations

### Example: Fixing Relative Imports

**Before:**
```typescript
import { User } from "../../domain/entities/user.entity";
import { ValidationError } from "./validation.error";
```

**After:**
```typescript
import { User } from "@/src/domain/entities/user.entity";
import { ValidationError } from "@/src/domain/errors/validation.error";
```

### Example: Fixing Layer Violations

**Before (in `src/application/use-cases/create-user.use-case.ts`):**
```typescript
// ❌ This violates layer boundaries
import { PostgresUserRepository } from "@/src/adapters/repositories/postgres-user.repository";
```

**After:**
```typescript
// ✅ Use the interface from domain layer instead
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";
```

## Configuration Files

- **`biome.json`**: Biome linting configuration with layer-specific overrides
- **`tsconfig.json`**: TypeScript path aliases (`@/*` and `@/src/*`)

## CI/CD Integration

Add to your CI pipeline:
```yaml
- run: bun run lint
- run: bun run ts
```

This ensures all imports follow the rules and TypeScript compiles before code is merged.

## Benefits

1. **Consistency**: All imports use the same pattern (`@/src/*`)
2. **Maintainability**: Easier to refactor when imports are absolute
3. **Architecture Enforcement**: Prevents accidental layer violations
4. **Type Safety**: TypeScript path aliases provide better IDE support

## Troubleshooting

### Biome not catching violations?

Biome's `noRestrictedImports` should catch most violations. If you see relative imports that aren't caught, ensure:
1. The file path matches the override patterns in `biome.json`
2. You're running `bun run lint` (not just formatting)
3. The import pattern matches the restricted patterns exactly

### TypeScript errors after changing imports?

Make sure your `tsconfig.json` has the path aliases configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/src/*": ["./src/*"]
    }
  }
}
```

### Import not resolving?

1. Check that the path alias is correct in `tsconfig.json`
2. Restart your TypeScript server in your IDE
3. Verify the file path is correct

