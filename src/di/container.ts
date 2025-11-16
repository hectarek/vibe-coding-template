/**
 * Dependency Injection Container
 *
 * This is a simple manual dependency injection container.
 * It wires up all the dependencies according to Clean Architecture:
 *
 * Infrastructure → Adapters → Application → Domain
 *
 * Dependencies flow inward: outer layers depend on inner layers,
 * but inner layers never depend on outer layers.
 *
 * This makes it easy to swap implementations:
 * - Change PostgresUserRepository to InMemoryUserRepository
 * - Change PlaceholderAuthService to NextAuthService or ClerkAuthService
 * - All without touching use cases or domain logic
 */

import { UserController } from "@/src/adapters/api/user.controller";
import { PostgresUserRepository } from "@/src/adapters/repositories/postgres-user.repository";
import { CreateUserUseCase } from "@/src/application/use-cases/create-user.use-case";
import { GetUserUseCase } from "@/src/application/use-cases/get-user.use-case";
import { ListUsersUseCase } from "@/src/application/use-cases/list-users.use-case";
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";
import type { AuthService } from "@/src/domain/services/auth.service.port";
import type { LoggerService } from "@/src/domain/services/logger.service.port";
import { PlaceholderAuthService } from "@/src/infrastructure/auth/placeholder-auth.service";
import { ConsoleLoggerService } from "@/src/infrastructure/logging/console-logger.service";

/**
 * Container that holds all dependencies
 */
export class Container {
  // Repositories
  private userRepository: UserRepository;

  // Services
  private authService: AuthService;
  private loggerService: LoggerService;

  // User use cases
  private createUserUseCase: CreateUserUseCase;
  private getUserUseCase: GetUserUseCase;
  private listUsersUseCase: ListUsersUseCase;

  // Controllers
  private userController: UserController;

  constructor() {
    // Initialize logger service first (other services might use it)
    this.loggerService = new ConsoleLoggerService();

    // Initialize repositories (Infrastructure/Adapters layer)
    // Using PostgreSQL implementation
    this.userRepository = new PostgresUserRepository();

    // Initialize auth service (can be swapped with NextAuth, Clerk, etc.)
    this.authService = new PlaceholderAuthService();

    // Initialize user use cases (Application layer)
    // They depend on the repository interface, not concrete implementation
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    this.getUserUseCase = new GetUserUseCase(this.userRepository);
    this.listUsersUseCase = new ListUsersUseCase(this.userRepository);

    // Initialize controllers (Adapters layer)
    // They depend on use cases and logger
    this.userController = new UserController(
      this.loggerService,
      this.createUserUseCase,
      this.getUserUseCase,
      this.listUsersUseCase,
    );
  }

  /**
   * Get the user controller
   */
  getUserController(): UserController {
    return this.userController;
  }

  /**
   * Get the auth service
   */
  getAuthService(): AuthService {
    return this.authService;
  }

  /**
   * Get the user repository (useful for testing or direct access)
   */
  getUserRepository(): UserRepository {
    return this.userRepository;
  }

  /**
   * Replace the user repository implementation
   * This is how you would swap implementations (e.g., for testing)
   */
  setUserRepository(repository: UserRepository): void {
    this.userRepository = repository;
    // Recreate use cases with new repository
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    this.getUserUseCase = new GetUserUseCase(this.userRepository);
    this.listUsersUseCase = new ListUsersUseCase(this.userRepository);
    // Recreate controller with new use cases and logger
    this.userController = new UserController(
      this.loggerService,
      this.createUserUseCase,
      this.getUserUseCase,
      this.listUsersUseCase,
    );
  }

  /**
   * Replace the auth service implementation
   * Swap PlaceholderAuthService with NextAuth, Clerk, or custom implementation
   */
  setAuthService(service: AuthService): void {
    this.authService = service;
  }

  /**
   * Get the logger service
   */
  getLoggerService(): LoggerService {
    return this.loggerService;
  }

  /**
   * Replace the logger service implementation
   */
  setLoggerService(service: LoggerService): void {
    this.loggerService = service;
    // Recreate controller with new logger
    this.userController = new UserController(
      this.loggerService,
      this.createUserUseCase,
      this.getUserUseCase,
      this.listUsersUseCase,
    );
  }
}

/**
 * Singleton instance (you can also create multiple instances if needed)
 */
let containerInstance: Container | null = null;

export function getContainer(): Container {
  if (!containerInstance) {
    containerInstance = new Container();
  }
  return containerInstance;
}

/**
 * Reset container (useful for testing)
 */
export function resetContainer(): void {
  containerInstance = null;
}
