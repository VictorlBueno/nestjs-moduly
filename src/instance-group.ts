import { Module, DynamicModule } from '@nestjs/common';

/**
 * Represents any class that can be instantiated
 */
export type ClassType<T = any> = new (...args: any[]) => T;

/**
 * Represents any instance value that can be shared across modules
 */
export type InstanceValue = any;

/**
 * Represents a provider object that can be used in NestJS providers array
 */
export interface ProviderObject {
  provide: string | symbol;
  useValue: InstanceValue;
}

/**
 * A group of module wrappers that export shared instances
 * Can be used in both imports and providers arrays
 */
export interface InstanceGroup {
  [key: string]: ClassType & ProviderObject;
}

/**
 * Configuration options for creating an instance group
 */
export interface InstanceGroupOptions {
  /**
   * Prefix for the provider tokens
   * @default 'InstanceGroup'
   */
  tokenPrefix?: string;

  /**
   * Whether to make the provider global (available to all modules)
   * @default false
   */
  global?: boolean;

  /**
   * Whether to register the instance's class as an additional token.
   * When enabled, instances can be injected without using @Inject().
   * @default true
   */
  useClassAsToken?: boolean;
}

/**
 * Internal storage for instance groups and their configurations
 */
class InstanceStorage {
  private static groups: Map<string, {
    group: InstanceGroup;
    options: InstanceGroupOptions;
    instances: Map<string, InstanceValue>;
  }> = new Map();

  static setGroup(name: string, group: InstanceGroup, options: InstanceGroupOptions = {}): void {
    this.groups.set(name, {
      group,
      options: { tokenPrefix: 'InstanceGroup', global: false, ...options },
      instances: new Map(),
    });
  }

  static getGroup(name: string): { group: InstanceGroup; options: InstanceGroupOptions; instances: Map<string, InstanceValue> } | undefined {
    return this.groups.get(name);
  }

  static getInstance(groupName: string, key: string): InstanceValue | undefined {
    const group = this.groups.get(groupName);
    return group?.instances.get(key);
  }

  static setInstance(groupName: string, key: string, instance: InstanceValue): void {
    const group = this.groups.get(groupName);
    if (group) {
      group.instances.set(key, instance);
    }
  }

  static getAllGroups(): Map<string, InstanceValue> {
    const all = new Map<string, InstanceValue>();
    this.groups.forEach((data, groupName) => {
      data.instances.forEach((instance, key) => {
        all.set(`${groupName}.${key}`, instance);
      });
    });
    return all;
  }
}

/**
 * Creates a dynamic NestJS module that wraps an instance
 * The returned module can be used in both imports and providers arrays
 *
 * Supports dual injection mode:
 * - With string token (flexible, requires @Inject())
 * - With class token (natural, no @Inject() needed)
 *
 * @param token - The injection token for the instance
 * @param instance - The instance to share
 * @param options - Configuration options
 * @returns A dynamic module class that also acts as a provider object
 *
 * @example
 * ```typescript
 * const wrapper = createWrapperModule('Repository.Users', new UserRepository());
 * // wrapper can be used in @Module({ imports: [wrapper] })
 * // wrapper can be used in @Module({ providers: [wrapper] })
 * // wrapper.provide === 'Repository.Users'
 * // wrapper.useValue === UserRepository instance
 *
 * // Dual injection - both work:
 * constructor(private userRepo: UserRepository) {}  // No @Inject()
 * constructor(@Inject('Repository.Users') private userRepo: UserRepository) {}
 * ```
 */
function createWrapperModule(
  token: string,
  instance: InstanceValue,
  options: InstanceGroupOptions = {}
): ClassType & ProviderObject {
  const { global = false, useClassAsToken = true } = options;

  @Module({})
  class WrapperModule {
    static register(): DynamicModule {
      const providers: any[] = [
        {
          provide: token,
          useValue: instance,
        },
      ];

      // Register class as additional token if enabled
      if (useClassAsToken && instance && instance.constructor) {
        providers.push({
          provide: instance.constructor,
          useValue: instance,
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

  // Add provider properties directly to the class prototype
  // This allows the module to be used in the providers array
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

  // Add instance class reference for convenience
  Object.defineProperty(WrapperModule, 'instanceClass', {
    value: instance?.constructor,
    enumerable: true,
    writable: false,
  });

  return WrapperModule as unknown as ClassType & ProviderObject;
}

/**
 * Creates a proxy-based instance group that automatically wraps instances
 * as NestJS modules and providers with dual injection support
 *
 * When you assign an instance to a property of the group, it automatically
 * creates a NestJS module wrapper that exports that instance. The wrapper
 * can be used in both `imports` and `providers` arrays, and supports both
 * injection styles (with and without @Inject()).
 *
 * @param name - The name of the instance group
 * @param options - Configuration options for the group
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
  const group: InstanceGroup = {};
  const resolvedOptions: InstanceGroupOptions = {
    tokenPrefix: name,
    global: false,
    ...options,
  };

  InstanceStorage.setGroup(name, group, resolvedOptions);

  return new Proxy(group, {
    set(target, property, value): boolean {
      if (typeof property === 'string') {
        const token = `${name}.${property}`;
        InstanceStorage.setInstance(name, property, value);

        const wrapperModule = createWrapperModule(token, value, resolvedOptions);
        target[property] = wrapperModule;
      }
      return true;
    },

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

/**
 * Gets the injection token for a specific instance
 *
 * @param groupName - The name of the instance group
 * @param key - The key within the group
 * @returns The injection token string
 *
 * @example
 * ```typescript
 * const token = getInjectionToken('Repository', 'Users');
 * // Returns 'Repository.Users'
 * ```
 */
export function getInjectionToken(groupName: string, key: string): string {
  return `${groupName}.${key}`;
}

/**
 * Gets all registered instances from all groups
 *
 * @returns A map of injection tokens to instance values
 *
 * @example
 * ```typescript
 * const allInstances = getAllInstances();
 * allInstances.forEach((instance, token) => {
 *   console.log(`${token}:`, instance);
 * });
 * ```
 */
export function getAllInstances(): Map<string, InstanceValue> {
  return InstanceStorage.getAllGroups();
}

/**
 * Converts an instance group to an array of modules
 *
 * @param groupName - The name of the instance group
 * @returns An array of module classes
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [...instanceGroupToArray('Repository')],
 * })
 * export class AppModule {}
 * ```
 */
export function instanceGroupToArray(groupName: string): ClassType[] {
  const group = InstanceStorage.getGroup(groupName);
  if (!group) {
    return [];
  }
  return Object.values(group.group);
}

/**
 * Converts all instance groups to an array of modules
 *
 * @returns An array of all registered module classes
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [...allInstanceGroupsToArray()],
 * })
 * export class AppModule {}
 * ```
 */
export function allInstanceGroupsToArray(): ClassType[] {
  const all: ClassType[] = [];
  InstanceStorage.getAllGroups().forEach((_, token) => {
    const [groupName, key] = token.split('.');
    const group = InstanceStorage.getGroup(groupName);
    if (group?.group[key]) {
      all.push(group.group[key]);
    }
  });
  return all;
}

/**
 * Gets the class constructor of an instance
 *
 * @param instance - The instance to get the class from
 * @returns The class constructor
 *
 * @example
 * ```typescript
 * const userRepo = new UserRepository();
 * const UserRepoClass = getInstanceClass(userRepo);
 * // UserRepoClass === UserRepository
 * ```
 */
export function getInstanceClass(instance: InstanceValue): any {
  return instance?.constructor;
}

/**
 * Gets the instance token for a specific group and key
 * Alias for getInjectionToken for convenience
 *
 * @param groupName - The name of the instance group
 * @param key - The key within the group
 * @returns The injection token string
 *
 * @example
 * ```typescript
 * const token = getInstanceToken('Repository', 'Users');
 * // Returns 'Repository.Users'
 * ```
 */
export function getInstanceToken(groupName: string, key: string): string {
  return getInjectionToken(groupName, key);
}
