import { Module, DynamicModule, Scope } from '@nestjs/common';
import { ClassType, InstanceValue, InstanceGroupOptions, ProviderObject } from '../types';

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
