/**
 * NestJS Moduly - Basic Usage Example
 *
 * This example demonstrates the most common patterns for using
 * NestJS Moduly to organize your dependencies and simplify
 * dependency injection in a NestJS application.
 *
 * @example
 * ```bash
 * # To use this example as reference:
 * npm install nestjs-moduly
 * ```
 */

import {Module, Injectable, Scope} from '@nestjs/common';
import { createInstanceGroup } from 'nestjs-moduly';

/**
 * User Repository - Handles user data persistence
 *
 * @example
 * ```typescript
 * const repo = new UserRepository(config);
 * repo.findUser('123'); // Returns { id: '123', name: 'John' }
 * ```
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
 * Address Repository - Handles address data persistence
 *
 * @example
 * ```typescript
 * const repo = new AddressRepository(config);
 * repo.findAddress('123'); // Returns { userId: '123', city: 'New York' }
 * ```
 */
@Injectable()
class AddressRepository {
  constructor(private config: any) {
    console.log('AddressRepository created');
  }

  findAddress(userId: string): { userId: string; city: string } {
    return { userId, city: 'New York' };
  }
}

/**
 * AWS Key Manager - Handles AWS service key generation
 *
 * @example
 * ```typescript
 * const manager = new AwsKeyManager(config);
 * manager.generateKey(); // Returns 'aws-key-123'
 * ```
 */
@Injectable()
class AwsKeyManager {
  constructor(private config: any) {
    console.log('AwsKeyManager created');
  }

  generateKey(): string {
    return 'aws-key-123';
  }
}

// ============================================================================
// Instance Groups Declaration
// ============================================================================

/**
 * Repository instance group - Contains all repository instances
 *
 * Instances in this group can be injected with natural injection
 * (without @Inject()) because each has a unique class
 *
 * @example
 * ```typescript
 * Repository.Users = new UserRepository(database);
 * Repository.Address = new AddressRepository(database);
 *
 * // Natural injection works:
 * constructor(
 *   private userRepo: UserRepository,
 *   private addressRepo: AddressRepository,
 * ) {}
 * ```
 */
export const Repository = createInstanceGroup('Repository');

/**
 * Service instance group - Contains all service instances
 *
 * Instances in this group can be injected with natural injection
 *
 * @example
 * ```typescript
 * Service.KeyManager = new AwsKeyManager(awsConfig);
 *
 * // Natural injection works:
 * constructor(private keyManager: AwsKeyManager) {}
 * ```
 */
export const Service = createInstanceGroup('Service');

// ============================================================================
// Instance Declaration
// ============================================================================

/**
 * Database configuration object
 */
const databaseConfig = { host: 'localhost', port: 5432 };

/**
 * AWS configuration object
 */
const awsConfig = { token: 'token', secret: 'secret' };

/**
 * Declare instances - They become NestJS modules automatically
 *
 * Each instance is wrapped in a dynamic NestJS module that
 * can be used in both `imports` and `providers` arrays.
 *
 * @example
 * ```typescript
 * // These can be used as imports or providers:
 * @Module({
 *   imports: [Repository.Users, Service.KeyManager],
 *   providers: [Repository.Address],
 * })
 * export class AppModule {}
 * ```
 */
Repository.Users = new UserRepository(databaseConfig);
Repository.Users.scope(Scope.REQUEST);
Repository.Address = new AddressRepository(databaseConfig);
Service.KeyManager = new AwsKeyManager(awsConfig);

// ============================================================================
// Module Definition
// ============================================================================

/**
 * Application Module - Main entry point
 *
 * This module imports all repository and service instances.
 * demonstrates using instances in the `imports` array.
 *
 * Dependencies are injected using natural injection (without @Inject())
 * which works because each instance has a unique class.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     Repository.Users,
 *     Repository.Address,
 *     Service.KeyManager,
 *   ],
 * })
 * export class AppModule {
 *   constructor(
 *     private userRepo: UserRepository,
 *     private addressRepo: AddressRepository,
 *     private keyManager: AwsKeyManager,
 *   ) {}
 * }
 * ```
 */
@Module({
  imports: [
    Repository.Users,
    Repository.Address,
    Service.KeyManager,
  ],
})
export class AppModule {
  /**
   * Constructor with natural injection
   *
   * All three dependencies are injected without @Inject() because
   * they have unique class constructors (UserRepository, AddressRepository, AwsKeyManager)
   *
   * @param userRepo - User repository instance (injected via UserRepository class token)
   * @param addressRepo - Address repository instance (injected via AddressRepository class token)
   * @param keyManager - AWS key manager instance (injected via AwsKeyManager class token)
   */
  constructor(
    private userRepo: UserRepository,
    private addressRepo: AddressRepository,
    private keyManager: AwsKeyManager,
  ) {
    console.log('AppModule initialized with natural injection');
    console.log('UserRepo:', this.userRepo);
    console.log('AddressRepo:', this.addressRepo);
    console.log('KeyManager:', this.keyManager);
  }
}
