# Vibe Coding Template

A production-ready Next.js template with Clean Architecture, TypeScript, and best practices built-in.

## 🚀 Features

- **Clean Architecture** - Strict layer separation with dependency inversion
- **TypeScript** - Full type safety throughout
- **Next.js 16** - App Router with Server Actions
- **Drizzle ORM** - Type-safe database queries
- **Bun** - Fast package manager and runtime
- **Biome** - Fast linting and formatting
- **Testing** - Bun test setup with examples
- **Zod Validation** - Runtime type validation
- **Error Handling** - Domain-specific error types
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling

## 📁 Architecture

This template follows Clean Architecture principles:

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

## 🏃 Quick Start

1. **Clone and install:**
   ```bash
   git clone <your-repo>
   cd vibe-coding-template
   bun install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   ```

3. **Set up database:**
   ```bash
   bun run db:push      # Push schema to database
   # or
   bun run db:migrate   # Run migrations
   ```

4. **Start development:**
   ```bash
   bun run dev
   ```

5. **Run tests:**
   ```bash
   bun test
   ```

## 📚 Documentation

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Clean Architecture patterns
- **[Frontend Data Flow](./docs/FRONTEND_DATA_FLOW.md)** - Data flow patterns
- **[Server Actions](./docs/SERVER_ACTIONS.md)** - Server Actions guide
- **[Authentication Setup](./docs/AUTH_SETUP.md)** - Auth integration guide
- **[Linting Rules](./docs/LINTING.md)** - Import and architecture rules
- **[SEO Setup](./docs/SEO.md)** - SEO utilities and Lighthouse CI

## 🛠️ Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun test` - Run tests
- `bun test:watch` - Run tests in watch mode
- `bun test:coverage` - Run tests with coverage
- `bun lint` - Lint and format code
- `bun lighthouse` - Run Lighthouse CI tests
- `bun ts` - Type check without emitting
- `bun db:generate` - Generate database migrations
- `bun db:push` - Push schema to database
- `bun db:migrate` - Run migrations
- `bun db:studio` - Open Drizzle Studio

## 🏗️ Architecture Principles

### Layer Rules

- **Domain**: Pure business logic, no external dependencies
- **Application**: Orchestrates domain logic via use cases
- **Adapters**: Implements domain interfaces (controllers, repositories)
- **Infrastructure**: Framework-specific code and external services

### Data Flow

```
Page → Server Action → Controller → Use Case → Repository
```

- Pages fetch initial data via Server Actions
- Server Actions call controllers from DI container
- Controllers delegate to use cases
- Use cases use repository interfaces
- UI never directly accesses application/domain layers

## 🧪 Testing

Tests use Bun's built-in test runner:

```bash
bun test              # Run all tests
bun test:watch        # Watch mode
bun test:coverage     # With coverage
```

See `tests/` directory for examples.

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Validation**: Zod
- **Package Manager**: Bun
- **Linting**: Biome
- **Testing**: Bun test
- **SEO**: Built-in utilities with robots.txt and sitemap
- **Performance**: Lighthouse CI for 100% scores

## 🔒 Environment Variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `NEXT_PUBLIC_APP_URL` - Your app URL (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Bun Documentation](https://bun.sh/docs)

## 🤝 Contributing

This is a template repository. Feel free to fork and customize for your needs!

## 📄 License

MIT
