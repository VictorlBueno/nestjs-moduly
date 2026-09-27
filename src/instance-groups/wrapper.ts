import { Module, DynamicModule, Scope } from '@nestjs/common';
import { ClassType, InstanceValue, InstanceGroupOptions, ProviderObject } from '../types';
import { InstanceResolver } from './resolver';

/**
 * Creates a dynamic NestJS module that wraps an instance
 *
 * The returned module can be used in both `imports` and `providers` arrays
 * and supports dual injection mode (with and without @Inject()).
 *
 * **Dual Injection Support:**
 *
 * 1. **String Token** (Flexible, requires @Inject()):
 *    ```typescript
 *    const wrapper = createWrapperModule('Repository.Users', new UserRepository());
 *    @Module({ providers: [wrapper] })
 *    constructor(@Inject('Repository.Users') private repo: UserRepository) {}
 *    ```
 *
 * 2. **Class Token** (Natural, no @Inject() needed):
 *    ```typescript
 *    const wrapper = createWrapperModule('Repository.Users', new UserRepository());
 *    @Module({ providers: [wrapper] })
 *    constructor(private repo: UserRepository) {}
 *    ```
 *
 * @param token - The injection token for the instance (typically "GroupName.Key")
 * @param instance - The instance to share across the application
 * @param options - Configuration options for the wrapper module
 * @returns A dynamic module class that also acts as a provider object
 *
 * @example
 * ```typescript
 * // Basic usage
 * const wrapper = createWrapperModule(
 *   'Repository.Users',
 *   new UserRepository(database),
 *   { global: false, useClassAsToken: true }
 * );
 *
 * // Use as module
 * @Module({ imports: [wrapper] })
 *
 * // Use as provider
 * @Module({ providers: [wrapper] })
 *
 * // Access wrapper properties
 * console.log(wrapper.provide);        // 'Repository.Users'
 * console.log(wrapper.useValue);       // UserRepository instance
 * console.log(wrapper.instanceClass);   // UserRepository class
 * ```
 */
export function createWrapperModule(
  token: string,
  instance: InstanceValue,
  options: InstanceGroupOptions = {}
): ClassType & ProviderObject {
  const { global = false, useClassAsToken = true, scope = Scope.DEFAULT } = options;

  /**
   * Dynamic NestJS module that wraps the instance
   *
   * This module uses the @Module decorator and provides a static
   * register() method that returns a DynamicModule configuration
   */
  @Module({})
  class WrapperModule {
    private static _scope = scope;

    /**
     * Sets the injection scope for this provider
     *
     * @param newScope - The scope to use (Scope.DEFAULT, Scope.REQUEST, Scope.TRANSIENT)
     * @returns The WrapperModule class for chaining
     *
     * @example
     * ```typescript
     * Repository.Users = new UserRepository(db);
     * Repository.Users.scope(Scope.REQUEST);
     * ```
     */
    static scope(newScope: any): ClassType & ProviderObject {
      WrapperModule._scope = newScope;
      return WrapperModule as unknown as ClassType & ProviderObject;
    }

    /**
     * Registers this module's dynamic configuration
     *
     * Creates providers array with the string token always included
     * and optionally adds a class token if useClassAsToken is enabled
     *
     * @returns DynamicModule configuration for NestJS
     */
    static register(): DynamicModule {
      const providers: any[] = [
        {
          provide: token,
          useValue: instance,
          scope: WrapperModule._scope,
        },
      ];

      // Register class as additional token if dual injection is enabled
      if (useClassAsToken && instance && instance.constructor) {
        providers.push({
          provide: instance.constructor,
          useValue: instance,
          scope: WrapperModule._scope,
        });
      }

      const exports = providers.map(p => p.provide);

      return {
        module: WrapperModule,
        providers,
        exports,
        global,
      };
    }
  }

  /**
   * Get the dynamic module configuration
   * This is automatically applied when the module is imported
   */
  const dynamicModuleConfig = WrapperModule.register();

  /**
   * Add dynamic module properties to the class
   * This allows NestJS to recognize it as a dynamic module
   */
  Object.defineProperty(WrapperModule, 'module', {
    value: WrapperModule,
    enumerable: true,
    writable: false,
  });

  Object.defineProperty(WrapperModule, 'providers', {
    value: dynamicModuleConfig.providers,
    enumerable: true,
    writable: false,
  });

  Object.defineProperty(WrapperModule, 'exports', {
    value: dynamicModuleConfig.exports,
    enumerable: true,
    writable: false,
  });

  Object.defineProperty(WrapperModule, 'global', {
    value: dynamicModuleConfig.global,
    enumerable: true,
    writable: false,
  });

  /**
   * Add provider properties directly to the class prototype
   *
   * This allows the module to be used in the providers array
   * by defining the 'provide' and 'useValue' properties on the class itself
   *
   * This is necessary for the wrapper to be used like:
   * @Module({ providers: [wrapper] })
   */
  Object.defineProperty(WrapperModule, 'provide', {
    value: token,
    enumerable: true,
    writable: false,
  });

  Object.defineProperty(WrapperModule, 'useValue', {
    value: instance,
    enumerable: true,
    writable: false,
  });

  /**
   * Add instance class reference for convenience
   *
   * This provides easy access to the class constructor
   * without needing to access instance.constructor
   *
   * Useful for type checking and creating new instances
   */
  Object.defineProperty(WrapperModule, 'instanceClass', {
    value: instance?.constructor,
    enumerable: true,
    writable: false,
  });

  return WrapperModule as unknown as ClassType & ProviderObject;
}

/**
 * Creates a dynamic NestJS module that wraps a lazy recipe
 *
 * Unlike {@link createWrapperModule}, the instance is not known when this
 * function runs. The recipe is resolved lazily — the module's `providers`,
 * `exports`, `useValue` and `instanceClass` are exposed as getters that trigger
 * resolution the first time NestJS reads them (at bootstrap), in dependency
 * order, and cache the result.
 *
 * This is what makes declaration order in the instances file irrelevant: the
 * recipe only runs once every group has been declared, and referencing sibling
 * instances inside the recipe resolves them on demand.
 *
 * @param token - The injection token for the instance ("GroupName.Key")
 * @param groupName - The name of the instance group
 * @param key - The key within the group
 * @param options - Configuration options for the wrapper module
 * @returns A dynamic module class that also acts as a provider object
 *
 * @example
 * ```typescript
 * // Assigned internally when you write:
 * Repository.Users = () => new UserRepository(Database.Primary, Cache.Redis);
 * ```
 */
export function createLazyWrapperModule(
  token: string,
  groupName: string,
  key: string,
  options: InstanceGroupOptions = {}
): ClassType & ProviderObject {
  const { global = false, useClassAsToken = true, scope = Scope.DEFAULT } = options;

  let currentScope = scope;
  let cachedConfig: { providers: any[]; exports: (string | symbol | Function)[] } | null = null;

  /**
   * Builds the provider configuration when NestJS first reads it at bootstrap.
   *
   * - DEFAULT scope: resolve the recipe once and share it (memoized `useValue`),
   *   plus the class token for dual injection.
   * - REQUEST/TRANSIENT scope: emit a real `useFactory` that NestJS re-runs per
   *   request/injection, so a fresh instance is produced each time. Only the
   *   string token is registered (inject scoped instances by their token or via
   *   `moduleRef.resolve`), since the class isn't known ahead of the first build.
   */
  const buildConfig = () => {
    if (cachedConfig) {
      return cachedConfig;
    }

    const isScoped = currentScope !== undefined && currentScope !== Scope.DEFAULT;

    let providers: any[];
    if (isScoped) {
      providers = [
        {
          provide: token,
          useFactory: () => InstanceResolver.build(groupName, key),
          scope: currentScope,
        },
      ];
    } else {
      const instance = InstanceResolver.resolve(groupName, key) as any;
      providers = [{ provide: token, useValue: instance, scope: currentScope }];

      if (useClassAsToken && instance && instance.constructor) {
        providers.push({
          provide: instance.constructor,
          useValue: instance,
          scope: currentScope,
        });
      }
    }

    cachedConfig = { providers, exports: providers.map((p) => p.provide) };
    return cachedConfig;
  };

  @Module({})
  class WrapperModule {}

  /**
   * Overrides the scope for this single instance (chainable), e.g.
   * `Request.Context.scope(Scope.TRANSIENT)`. Takes effect because the config
   * is built lazily at bootstrap, after this file has run.
   */
  Object.defineProperty(WrapperModule, 'scope', {
    value: (newScope: any) => {
      currentScope = newScope;
      return WrapperModule;
    },
    enumerable: true,
  });

  /**
   * Dynamic module properties, exposed as getters so resolution is deferred
   * until NestJS reads them at bootstrap
   */
  Object.defineProperty(WrapperModule, 'module', {
    get: () => WrapperModule,
    enumerable: true,
  });

  Object.defineProperty(WrapperModule, 'providers', {
    get: () => buildConfig().providers,
    enumerable: true,
  });

  Object.defineProperty(WrapperModule, 'exports', {
    get: () => buildConfig().exports,
    enumerable: true,
  });

  Object.defineProperty(WrapperModule, 'global', {
    get: () => global,
    enumerable: true,
  });

  /**
   * Provider properties so the wrapper can also be used in a `providers` array
   */
  Object.defineProperty(WrapperModule, 'provide', {
    get: () => token,
    enumerable: true,
  });

  const isScoped = () =>
    currentScope !== undefined && currentScope !== Scope.DEFAULT;

  Object.defineProperty(WrapperModule, 'useValue', {
    get: () => (isScoped() ? undefined : InstanceResolver.resolve(groupName, key)),
    enumerable: true,
  });

  Object.defineProperty(WrapperModule, 'instanceClass', {
    get: () =>
      isScoped()
        ? undefined
        : (InstanceResolver.resolve(groupName, key) as any)?.constructor,
    enumerable: true,
  });

  return WrapperModule as unknown as ClassType & ProviderObject;
}
