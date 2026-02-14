/**
 * NestJS Moduly - Scope Configuration Example
 *
 * This example demonstrates how to control the lifecycle of instances
 * using NestJS injection scopes (DEFAULT, REQUEST, TRANSIENT).
 *
 * @example
 * ```bash
 * # To use this example as reference:
 * npm install nestjs-moduly
 * ```
 */

import { Module, Injectable, Scope } from '@nestjs/common';
import { createInstanceGroup } from 'nestjs-moduly';

/**
 * User Repository - Handles user data persistence
 *
 * This repository is a good candidate for singleton scope as it's stateless
 * and can be shared across the application
 */
@Injectable()
class UserRepository {
  constructor(private config: any) {
    console.log('UserRepository created');
  }

  findUser(id: string): { id: string; name: string } {
    return { id, name: 'John Doe' };
  }
}

/**
 * Request Context - Holds request-specific data
 *
 * This service should be request-scoped as each HTTP request needs its own
 * context with user-specific data
 */
@Injectable({ scope: Scope.REQUEST })
class RequestContext {
  private requestId: string;
  private userId: string;

  constructor() {
    this.requestId = `req-${Math.random()}`;
    this.userId = 'user-123';
    console.log(`RequestContext created: ${this.requestId}`);
  }

  getRequestId(): string {
    return this.requestId;
  }

  getUserId(): string {
    return this.userId;
  }
}

/**
 * Cache Service - Handles caching operations
 *
 * This service is transient to ensure each injection gets a fresh instance,
 * useful when you need isolated state per usage
 */
@Injectable({ scope: Scope.TRANSIENT })
class CacheService {
  private instanceId: string;

  constructor() {
    this.instanceId = `cache-${Math.random()}`;
    console.log(`CacheService created: ${this.instanceId}`);
  }

  get(key: string): any {
    console.log(`CacheService ${this.instanceId}: get(${key})`);
    return `value-for-${key}`;
  }

  set(key: string, value: any): void {
    console.log(`CacheService ${this.instanceId}: set(${key}, ${value})`);
  }
}

// ============================================================================
// Instance Groups with Different Scopes
// ============================================================================

/**
 * Repository group with DEFAULT scope (Singleton)
 *
 * All instances in this group are singletons by default
 */
export const Repository = createInstanceGroup('Repository');

/**
 * Services group with REQUEST scope
 *
 * All instances in this group are request-scoped by default
 */
export const Services = createInstanceGroup('Services', {
  scope: Scope.REQUEST,
});

/**
 * Cache group with TRANSIENT scope
 *
 * All instances in this group are transient by default
 */
export const Cache = createInstanceGroup('Cache', {
  scope: Scope.TRANSIENT,
});

// ============================================================================
// Instance Declaration with Scope Override
// ============================================================================

const databaseConfig = { host: 'localhost', port: 5432 };

/**
 * Declare instances - they become NestJS modules automatically
 *
 * Repository.Users is explicitly set to REQUEST scope (overrides group default)
 * Services.Context inherits REQUEST scope from group
 * Cache.Memory inherits TRANSIENT scope from group
 */
Repository.Users = new UserRepository(databaseConfig);
Repository.Users.scope(Scope.REQUEST);

Services.Context = new RequestContext();

Cache.Memory = new CacheService();

// ============================================================================
// Module Definition
// ============================================================================

/**
 * Application Module - Demonstrates scope usage
 *
 * This module imports all instances with different scopes
 */
@Module({
  imports: [
    Repository.Users,
    Services.Context,
    Cache.Memory,
  ],
})
export class AppModule {
  constructor(
    private userRepo: UserRepository,
    private context: RequestContext,
    private cache: CacheService,
  ) {
    console.log('AppModule initialized');
    console.log('UserRepo scope:', Repository.Users.scope);
    console.log('Context scope:', Services.Context.scope);
    console.log('Cache scope:', Cache.Memory.scope);
  }
}

/**
 * Service demonstrating multiple cache injections
 *
 * Since CacheService is TRANSIENT, each injection gets a new instance
 */
@Injectable()
export class SomeService {
  constructor(
    private cache1: CacheService,
    private cache2: CacheService,
  ) {
    console.log('cache1 and cache2 are different instances:', cache1 !== cache2);
  }
}

// ============================================================================
// Scope Reference
// ============================================================================

/**
 * Scope Lifecycle Comparison
 *
 * **DEFAULT (Singleton)**
 * - One instance for the entire application
 * - Created on first injection
 * - Reused for all subsequent injections
 * - Perfect for: Database connections, external services, stateless services
 *
 * **REQUEST**
 * - One instance per HTTP request
 * - Created at the start of each request
 * - Destroyed after the request completes
 * - Perfect for: Request context, user data, request-scoped logging
 *
 * **TRANSIENT**
 * - New instance per injection
 * - Created every time it's injected
 * - Not shared between providers
 * - Perfect for: Stateful services, isolated operations, custom state
 */
