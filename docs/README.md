# Documentation Index

This directory contains comprehensive documentation for the Vibe Coding Template.

## Architecture Documentation

- **[Clean Architecture](./ARCHITECTURE.md)** - Complete guide to the Clean Architecture pattern used in this codebase
- **[Frontend Data Flow](./FRONTEND_DATA_FLOW.md)** - Data flow patterns for Next.js App Router with Server Actions
- **[Server Actions](./SERVER_ACTIONS.md)** - How to use Server Actions in this project
- **[Authentication Setup](./AUTH_SETUP.md)** - Guide for setting up authentication
- **[Linting Rules](./LINTING.md)** - Linting rules and import restrictions

## Quick Start Guides

### For New Features

1. **Backend Feature**: Follow [Clean Architecture](./ARCHITECTURE.md) guide
2. **Frontend Feature**: Follow [Frontend Data Flow](./FRONTEND_DATA_FLOW.md) guide
3. **API Endpoint**: Use [Server Actions](./SERVER_ACTIONS.md) pattern

### Key Patterns

- **Data Flow**: `Page -> Server Action -> Controller -> Use Case -> Repository`
- **Layer Rules**: Dependencies point inward, never outward
- **Imports**: Always use `@/src/*` instead of relative paths
- **Testing**: Use Bun's built-in test runner

## Architecture Overview

```
app/                    # Next.js App Router
├── _components/        # Client components (UI only)
├── actions/           # Server Actions (bridge to backend)
└── **/page.tsx        # Server components (fetch data)

src/
├── domain/            # Pure business logic (innermost)
├── application/       # Use cases (orchestrate domain)
├── adapters/          # Controllers & repository implementations
└── infrastructure/    # Framework & external services
```

## Rules Enforcement

All rules are automatically enforced via:
- **Biome**: Linting and formatting
- **TypeScript**: Type checking
- **Cursor Rules**: AI assistant guidance

See [Linting Rules](./LINTING.md) for details.

