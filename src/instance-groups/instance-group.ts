import { InstanceGroup, WriteableInstanceGroup, InstanceGroupOptions, InstanceValue, ClassType } from '../types';
import { InstanceStorage } from './storage';
import { createWrapperModule } from './wrapper';

/**
 * Creates a proxy-based instance group that automatically wraps instances
 * as NestJS modules and providers with dual injection support
 *
 * When you assign an instance to a property of the group, it automatically
 * creates a NestJS module wrapper that exports that instance. The wrapper
 * can be used in both `imports` and `providers` arrays, and supports both
 * injection styles (with and without @Inject()).
 *
 * **Key Features:**
 *
 * 1. **Automatic Wrapping:** Instances become NestJS modules automatically
 * 2. **Dual Injection Support:** Inject with or without @Inject() decorator
 * 3. **Singleton Pattern:** Same instance shared across the application
 * 4. **Proxy Interception:** Automatic creation of wrapper modules
 *
 * @param name - The name of the instance group (used for token generation)
 * @param options - Configuration options for the instance group
 * @returns A proxy object that automatically wraps instances as modules/providers
 *
 * @example
 * ```typescript
 * // Create an instance group
 * export const Repository = createInstanceGroup('Repository');
 *
 * // Declare instances - they become modules automatically
 * Repository.Users = new UserRepository(database);
 * Repository.Address = new AddressRepository(database);
 *
 * // Use in any module (both imports and providers work!)
 * @Module({
 *   imports: [Repository.Users],
 *   providers: [Repository.Address],
 * })
 * export class AppModule {}
 *
 * // Inject WITHOUT @Inject() (natural injection)
 * constructor(private userRepo: UserRepository) {}
 *
 * // Or inject WITH @Inject() (flexible injection)
 * constructor(
 *   @Inject('Repository.Users') private userRepo: UserRepository,
 * ) {}
 * ```
 */
export function createInstanceGroup(
  name: string,
  options: InstanceGroupOptions = {}
): InstanceGroup {
  const group: WriteableInstanceGroup = {};
  const resolvedOptions: InstanceGroupOptions = {
    tokenPrefix: name,
    global: false,
    ...options,
  };

  InstanceStorage.setGroup(name, group, resolvedOptions);

  /**
   * Proxy that intercepts property assignments and reads
   *
   * **Assignment Interception (set):**
   * When you assign a value to a property (e.g., Repository.Users = instance),
   * the proxy automatically:
   * 1. Stores the instance in InstanceStorage
   * 2. Creates a WrapperModule for the instance
   * 3. Assigns the wrapper to the property
   *
   * **Read Interception (get):**
   * Returns the previously created WrapperModule
   * Supports iteration via Symbol.iterator for convenience
   *
   * This allows the property to be used in both @Module({ imports: [...] })
   * and @Module({ providers: [...] })
   */
  return new Proxy(group, {
    /**
     * Intercepts property assignments to create wrapper modules
     *
     * This enables the automatic wrapping behavior when you
     * assign instances to group properties
     */
    set(target, property, value): boolean {
      if (typeof property === 'string') {
        const token = `${name}.${property}`;
        InstanceStorage.setInstance(name, property, value);

        const wrapperModule = createWrapperModule(token, value, resolvedOptions);
        target[property] = wrapperModule;
      }
      return true;
    },

    /**
     * Intercepts property reads to return wrapper modules
     *
     * Also supports iteration via Symbol.iterator for
     * convenient array-like operations on the group
     */
    get(target, property): any {
      if (property === Symbol.iterator) {
        return function* () {
          for (const key in target) {
            yield { key: `${name}.${key}`, module: target[key] };
          }
        };
      }
      if (typeof property === 'string') {
        return target[property];
      }
      return undefined;
    },
  });
}
