/**
 * NestJS Moduly - Dual Injection Example
 *
 * This example demonstrates the dual injection support feature,
 * showing how to use both natural injection (without @Inject())
 * and flexible injection (with @Inject()) in the same application.
 *
 * This is particularly useful when you have multiple instances of the same class
 * or need explicit control over injection tokens.
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
 * Database Service - Handles database operations
 *
 * This class can have multiple instances (e.g., primary and replica)
 * which requires the use of @Inject() for explicit token specification.
 *
 * @example
 * ```typescript
 * const primaryDb = new DatabaseService({ host: 'primary-db' });
 * const replicaDb = new DatabaseService({ host: 'replica-db' });
 *
 * primaryDb.query('SELECT * FROM users');
 * replicaDb.query('SELECT * FROM users');
 * ```
 */
@Injectable()
class DatabaseService {
  constructor(private config: { host: string; port: number }) {
    console.log(`DatabaseService created for ${config.host}:${config.port}`);
  }

  query(sql: string): { sql: string; result: string; host: string } {
    return { sql, result: 'query executed', host: this.config.host };
  }
}

// ============================================================================
// Instance Groups Declaration
// ============================================================================

/**
 * Database instance group - Contains all database instances
 *
 * Because we have multiple instances of the same class (DatabaseService),
 * we must use @Inject() for flexible injection to specify which instance we want.
 *
 * @example
 * ```typescript
 * Database.Primary = new DatabaseService(primaryConfig);
 * Database.Replica = new DatabaseService(replicaConfig);
 *
 * // Flexible injection required:
 * constructor(
 *   @Inject('Database.Primary') private primaryDb: DatabaseService,
 *   @Inject('Database.Replica') private replicaDb: DatabaseService,
 * ) {}
 * ```
 */
export const Database = createInstanceGroup('Database');

// ============================================================================
// Instance Declaration
// ============================================================================

/**
 * Primary database configuration
 */
const primaryConfig = { host: 'primary-db', port: 5432 };

/**
 * Replica database configuration
 */
const replicaConfig = { host: 'replica-db', port: 5432 };

/**
 * Declare instances - They become NestJS modules automatically
 *
 * Both instances use the same DatabaseService class, so we must
 * use @Inject() to specify which one to inject.
 *
 * @example
 * ```typescript
 * Database.Primary = new DatabaseService(primaryConfig);
 * Database.Replica = new DatabaseService(replicaConfig);
 *
 * @Module({
 *   imports: [Database.Primary, Database.Replica],
 * })
 * export class DualInjectionModule {}
 * ```
 */
Database.Primary = new DatabaseService(primaryConfig);
Database.Replica = new DatabaseService(replicaConfig);

// ============================================================================
// Module Definition
// ============================================================================

/**
 * Dual Injection Module - Demonstrates explicit token-based injection
 *
 * This module imports both database instances and uses @Inject() to specify
 * which instance should be injected. This is necessary when you have
 * multiple instances of the same class.
 *
 * Note: Natural injection (without @Inject()) would NOT work here because
 * both parameters would try to inject the same DatabaseService class,
 * causing ambiguity.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     Database.Primary,
 *     Database.Replica,
 *   ],
 * })
 * export class DualInjectionModule {
 *   constructor(
 *     @Inject('Database.Primary') private primaryDb: DatabaseService,
 *     @Inject('Database.Replica') private replicaDb: DatabaseService,
 *   ) {}
 *
 *   async getData(query: string) {
 *     const primaryResult = this.primaryDb.query(query);
 *     const replicaResult = this.replicaDb.query(query);
 *     return { primary: primaryResult, replica: replicaResult };
 *   }
 * }
 * ```
 */
@Module({
  imports: [
    Database.Primary,
    Database.Replica,
  ],
})
export class DualInjectionModule {
  /**
   * Constructor with flexible injection using @Inject()
   *
   * Both parameters use @Inject() with explicit tokens to avoid ambiguity.
   * Even though both are DatabaseService instances, the tokens
   * 'Database.Primary' and 'Database.Replica' differentiate them.
   *
   * @param primaryDb - Primary database instance (injected via 'Database.Primary' token)
   * @param replicaDb - Replica database instance (injected via 'Database.Replica' token)
   */
  constructor(
    @Inject('Database.Primary') private primaryDb: DatabaseService,
    @Inject('Database.Replica') private replicaDb: DatabaseService,
  ) {
    console.log('DualInjectionModule initialized with flexible injection');
    console.log('Primary DB:', this.primaryDb);
    console.log('Replica DB:', this.replicaDb);
  }

  /**
   * Example method using both instances
   *
   * @param query - SQL query to execute
   * @returns Results from both primary and replica databases
   */
  async getData(query: string): Promise<{
    primary: ReturnType<DatabaseService['query']>;
    replica: ReturnType<DatabaseService['query']>;
  }> {
    const primaryResult = this.primaryDb.query(query);
    const replicaResult = this.replicaDb.query(query);

    return {
      primary: primaryResult,
      replica: replicaResult,
    };
  }
}
