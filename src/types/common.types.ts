import { Module } from '@nestjs/common';

/**
 * Represents a class constructor that can be instantiated
 *
 * @template T - The type of instance this constructor creates
 * @typeParam args - Constructor arguments
 * @example
 * ```typescript
 * class UserRepository {
 *   constructor(private db: Database) {}
 * }
 * const ctor: ClassType<UserRepository> = UserRepository;
 * ```
 */
export type ClassType<T = any> = new (...args: any[]) => T;

/**
 * Represents any value that can be used as a shared instance
 *
 * This type is intentionally generic to allow any instance value
 * that can be shared across modules through the DI system
 *
 * @example
 * ```typescript
 * const userRepo = new UserRepository();
 * const instance: InstanceValue = userRepo;
 * ```
 */
export type InstanceValue = unknown;

/**
 * Represents a provider object configuration for NestJS dependency injection
 *
 * This interface defines the structure required for a value
 * to be used in the `providers` array of a NestJS module
 *
 * @example
 * ```typescript
 * const provider: ProviderObject = {
 *   provide: 'MyService',
 *   useValue: myServiceInstance,
 * };
 * @Module({ providers: [provider] })
 * ```
 */
export interface ProviderObject {
  /**
   * The injection token for this provider
   * Can be a string or symbol
   */
  provide: string | symbol;

  /**
   * The value to provide for this token
   * Typically an instance of a service, repository, or other dependency
   */
  useValue: InstanceValue;
}

/**
 * Represents a group of module wrappers that export shared instances
 *
 * Each property in an instance group is a wrapper that can be used
 * in both `imports` and `providers` arrays of NestJS modules
 *
 * Note: While the type allows any value to be assigned, the proxy
 * automatically transforms instances into wrapper modules at runtime.
 *
 * @example
 * ```typescript
 * export const Repository = createInstanceGroup('Repository');
 * Repository.Users = new UserRepository(database);
 * // Repository.Users can now be used in @Module({ imports: [Repository.Users] })
 * ```
 */
export interface InstanceGroup {
  [key: string]: any;
}

/**
 * Writeable version of InstanceGroup used internally for proxy operations
 *
 * This type allows instances to be assigned before they are wrapped.
 * The proxy's set handler transforms instances into wrapper modules.
 *
 * @internal
 */
export interface WriteableInstanceGroup {
  [key: string]: any;
}

/**
 * Configuration options for creating an instance group
 *
 * These options control the behavior of instance groups,
 * including how instances are registered and made available
 * for dependency injection
 *
 * @example
 * ```typescript
 * const options: InstanceGroupOptions = {
 *   tokenPrefix: 'Repo',
 *   global: true,
 *   useClassAsToken: false,
 * };
 * export const Repository = createInstanceGroup('Repository', options);
 * ```
 */
export interface InstanceGroupOptions {
  /**
   * Custom prefix for provider tokens
   *
   * If specified, tokens will use this prefix instead of the group name
   *
   * @default The group name
   * @example
   * ```typescript
   * createInstanceGroup('Repository', { tokenPrefix: 'Repo' })
   * // Tokens will be 'Repo.Users', 'Repo.Products', etc.
   * ```
   */
  tokenPrefix?: string;

  /**
   * Whether to make all instances in this group globally available
   *
   * When true, instances can be injected in any module without
   * explicitly importing the group
   *
   * @default false
   * @example
   * ```typescript
   * export const GlobalServices = createInstanceGroup('GlobalServices', { global: true });
   * GlobalServices.Logger = new Logger();
   * // Logger can be injected anywhere without importing GlobalServices
   * ```
   */
  global?: boolean;

  /**
   * Whether to register the instance's class as an additional injection token
   *
   * When enabled (default), instances can be injected without using @Inject()
   * by using the class constructor as the token
   *
   * When disabled, only the string token is registered
   *
   * @default true
   * @example
   * ```typescript
   * // With dual injection enabled (default)
   * export const Repository = createInstanceGroup('Repository');
   * Repository.Users = new UserRepository();
   * constructor(private repo: UserRepository) {} // Works!
   *
   * // With dual injection disabled
   * export const Repository = createInstanceGroup('Repository', { useClassAsToken: false });
   * Repository.Users = new UserRepository();
   * constructor(@Inject('Repository.Users') private repo: UserRepository) {} // Required
   * ```
   */
  useClassAsToken?: boolean;
}

/**
 * Represents any NestJS module class that can be imported
 *
 * This type is used to define module groups where
 * each property is a module class
 *
 * @example
 * ```typescript
 * export const Features = createModuleGroup('Features');
 * Features.Users = UsersModule;
 * Features.Products = ProductsModule;
 * ```
 */
export type AnyModule = new (...args: any[]) => any;

/**
 * Represents a group of NestJS modules organized by feature or layer
 *
 * Each property in a module group is a NestJS module class
 * that can be imported in other modules
 *
 * @example
 * ```typescript
 * export const Repository = createModuleGroup('Repository');
 * Repository.Users = UsersModule;
 * Repository.Products = ProductsModule;
 * // @Module({ imports: [Repository.Users, Repository.Products] })
 * ```
 */
export interface ModuleGroup {
  [key: string]: AnyModule;
}
