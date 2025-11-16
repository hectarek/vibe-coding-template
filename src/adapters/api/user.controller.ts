/**
 * Adapter: UserController
 *
 * This is an ADAPTER in the Interface Adapters layer.
 * It handles HTTP-specific concerns and delegates to use cases.
 *
 * This controller is framework-agnostic in its logic (it doesn't import
 * Next.js, Express, etc. directly). It receives plain data and returns
 * plain data, making it easy to test and swap frameworks.
 */

import {
  BaseController,
  type ControllerResponse,
} from "@/src/adapters/api/base/base.controller";
import type { CreateUserUseCase } from "@/src/application/use-cases/create-user.use-case";
import type { GetUserUseCase } from "@/src/application/use-cases/get-user.use-case";
import type { ListUsersUseCase } from "@/src/application/use-cases/list-users.use-case";
import type { LoggerService } from "@/src/domain/services/logger.service.port";

/**
 * DTOs (Data Transfer Objects) for API layer
 * These separate the API contract from domain entities
 */
export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface UserResponse {
  id: string; // String representation of ID for API responses
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export class UserController extends BaseController {
  constructor(
    logger: LoggerService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {
    super(logger);
  }

  /**
   * Handle creating a user
   *
   * This method receives plain data (not HTTP request objects),
   * calls the use case, and returns a response DTO.
   */
  async createUser(
    input: CreateUserRequest,
  ): Promise<ControllerResponse<UserResponse>> {
    this.logger.debug("UserController > createUser: begin", {
      email: input.email,
      name: input.name,
    });

    return this.execute(async () => {
      const user = await this.createUserUseCase.execute(input);
      const response = this.toUserResponse(user);

      this.logger.trace("UserController > createUser: end", {
        userId: response.id,
        email: response.email,
      });

      return response;
    });
  }

  /**
   * Handle getting a user by ID
   */
  async getUserById(id: string): Promise<ControllerResponse<UserResponse>> {
    this.logger.debug("UserController > getUserById: begin", { id });

    return this.execute(async () => {
      const user = await this.getUserUseCase.execute(id);
      const response = this.toUserResponse(user);

      this.logger.trace("UserController > getUserById: end", {
        id,
        found: true,
      });

      return response;
    });
  }

  /**
   * Handle listing users
   */
  async listUsers(
    limit?: number,
    offset?: number,
  ): Promise<ControllerResponse<{ users: UserResponse[]; total: number }>> {
    this.logger.debug("UserController > listUsers: begin", { limit, offset });

    return this.execute(async () => {
      const result = await this.listUsersUseCase.execute({ limit, offset });
      const response = {
        users: result.users.map((user) => this.toUserResponse(user)),
        total: result.total,
      };

      this.logger.trace("UserController > listUsers: end", {
        count: response.users.length,
        total: response.total,
      });

      return response;
    });
  }

  /**
   * Convert domain entity to API response DTO
   */
  private toUserResponse(user: {
    id: number;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponse {
    return {
      id: String(user.id), // Convert number ID to string for API
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
