/**
 * NestJS Moduly - Global Providers Example
 *
 * This example demonstrates how to create global instance groups
 * that make instances available to all modules without explicit imports.
 *
 * Global providers are particularly useful for:
 * - Infrastructure services (logging, metrics, etc.)
 * - Shared utilities (date formatters, validators, etc.)
 * - Configuration objects that need to be everywhere
 *
 * @example
 * ```bash
 * # To use this example as reference:
 * npm install nestjs-moduly
 * ```
 */

import { Module, Injectable, Inject } from '@nestjs/common';
import { createInstanceGroup } from 'nestjs-moduly';

/**
 * Logger Service - Provides logging functionality
 *
 * This service can be made globally available so any module
 * can inject it without explicitly importing the group.
 *
 * @example
 * ```typescript
 * const logger = new LoggerService();
 * logger.log('Application started');
 * ```
 */
@Injectable()
class LoggerService {
  constructor() {
    console.log('LoggerService created');
  }

  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }
}

// ============================================================================
// Instance Groups Declaration
// ============================================================================

/**
 * Global Infrastructure instance group
 *
 * This group is configured with `global: true`, which means all instances
 * registered here are available to the entire application without explicit imports.
 *
 * @example
 * ```typescript
 * export const GlobalInfrastructure = createInstanceGroup('GlobalInfrastructure', {
 *   global: true,
 * });
 *
 * GlobalInfrastructure.Logger = new LoggerService();
 *
 * // Now LoggerService can be injected anywhere:
 * @Injectable()
 * export class AnyService {
 *   constructor(
 *     @Inject('GlobalInfrastructure.Logger') private logger: LoggerService,
 *   ) {}
 * }
 * ```
 */
export const GlobalInfrastructure = createInstanceGroup('GlobalInfrastructure', {
  tokenPrefix: 'Global',
  global: true,
});

// ============================================================================
// Instance Declaration
// ============================================================================

/**
 * Declare global instances
 *
 * These instances become globally available to all modules.
 * They can be injected using their string tokens regardless of
 * whether the importing module has imported the GlobalInfrastructure group.
 *
 * Note: While global providers can be injected anywhere,
 * natural injection (without @Inject()) is NOT supported for global providers.
 * You must use @Inject() with the full token string.
 *
 * @example
 * ```typescript
 * GlobalInfrastructure.Logger = new LoggerService();
 *
 * // Works in any module:
 * @Injectable()
 * export class SomeService {
 *   constructor(
 *     @Inject('GlobalInfrastructure.Logger') private logger: LoggerService,
 *   ) {
 *     this.logger.log('Service initialized');
 *   }
 * }
 * ```
 */
GlobalInfrastructure.Logger = new LoggerService();

// ============================================================================
// Service Definition
// ============================================================================

/**
 * Example Service - Uses global provider
 *
 * This service demonstrates injecting a globally available provider.
 * Notice that we don't need to import GlobalInfrastructure
 * in the @Module decorator because it's global.
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [AnyService],
 * })
 * export class GlobalProvidersModule {}
 *
 * // AnyService can inject the global logger:
 * constructor(
 *   @Inject('GlobalInfrastructure.Logger') private logger: LoggerService,
 * ) {}
 * ```
 */
@Injectable()
export class AnyService {
  /**
   * Constructor with global provider injection
   *
   * The LoggerService is injected using its string token
   * 'GlobalInfrastructure.Logger'. This works because:
   * 1. The global infrastructure group has global: true
   * 2. Logger was registered in that group
   *
   * Note: Natural injection (without @Inject()) does NOT work with global providers.
   * You must use @Inject() with the full token string.
   *
   * @param logger - Global logger instance (injected via 'GlobalInfrastructure.Logger' token)
   */
  constructor(
    @Inject('GlobalInfrastructure.Logger') private logger: LoggerService,
  ) {
    this.logger.log('AnyService initialized with global provider');
  }

  /**
   * Example method using the global logger
   *
   * @param operation - The operation being performed
   */
  performOperation(operation: string): void {
    this.logger.log(`Performing: ${operation}`);
  }

  /**
   * Example method using the global logger for errors
   *
   * @param error - The error that occurred
   */
  handleError(error: string): void {
    this.logger.error(`Error occurred: ${error}`);
  }
}

// ============================================================================
// Module Definition
// ============================================================================

/**
 * Global Providers Module - Module that uses global providers
 *
 * This module doesn't need to import the GlobalInfrastructure group
 * because the instances are globally available. It only provides
 * services that use those global instances.
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [AnyService],
 * })
 * export class GlobalProvidersModule {}
 * ```
 */
@Module({
  providers: [AnyService],
})
export class GlobalProvidersModule {
  /**
   * Constructor - No dependencies needed here
   *
   * Global providers are automatically available.
   * The AnyService will receive the global LoggerService
   * via the @Inject('GlobalInfrastructure.Logger') decorator.
   */
  constructor() {
    console.log('GlobalProvidersModule initialized');
  }
}
