import { InstanceGroup, InstanceGroupOptions, InstanceValue, InstanceFactory } from '../types';

/**
 * Internal storage for managing instance groups and their configurations
 *
 * This class provides a centralized storage mechanism for all instance groups
 * created throughout the application. It maintains a map of group names to
 * their configurations, including the group object, options, and instances.
 *
 * @internal
 * @example
 * ```typescript
 * // Typically not used directly by library users
 * // Internal to nestjs-moduly
 * InstanceStorage.setGroup('Repository', group, options);
 * const group = InstanceStorage.getGroup('Repository');
 * ```
 */
export class InstanceStorage {
  /**
   * Internal storage for all instance groups
   *
   * Maps group names to their complete configuration including
   * the group object, options, and instance map
   */
  private static groups: Map<string, {
    group: InstanceGroup;
    options: InstanceGroupOptions;
    instances: Map<string, InstanceValue>;
    recipes: Map<string, InstanceFactory>;
  }> = new Map();

  /**
   * Stores a new instance group with its configuration
   *
   * @param name - The name of the instance group
   * @param group - The instance group object containing wrapped instances
   * @param options - Configuration options for the instance group
   * @example
   * ```typescript
   * const group = { Users: userRepoWrapper };
   * InstanceStorage.setGroup('Repository', group, { global: false });
   * ```
   */
  static setGroup(name: string, group: InstanceGroup, options: InstanceGroupOptions = {}): void {
    this.groups.set(name, {
      group,
      options: { tokenPrefix: 'InstanceGroup', global: false, ...options },
      instances: new Map(),
      recipes: new Map(),
    });
  }

  /**
   * Retrieves an instance group configuration by name
   *
   * @param name - The name of the instance group to retrieve
   * @returns The instance group configuration, or undefined if not found
   * @throws {Error} When the group name is not found
   * @example
   * ```typescript
   * const group = InstanceStorage.getGroup('Repository');
   * if (group) {
   *   console.log('Found group:', group.group);
   * }
   * ```
   */
  static getGroup(name: string): { group: InstanceGroup; options: InstanceGroupOptions; instances: Map<string, InstanceValue> } | undefined {
    return this.groups.get(name);
  }

  /**
   * Retrieves a specific instance from a group
   *
   * @param groupName - The name of the instance group
   * @param key - The key within the group to retrieve the instance for
   * @returns The instance value, or undefined if not found
   * @example
   * ```typescript
   * const userRepo = InstanceStorage.getInstance('Repository', 'Users');
   * if (userRepo) {
   *   console.log('Found instance:', userRepo);
   * }
   * ```
   */
  static getInstance(groupName: string, key: string): InstanceValue | undefined {
    const group = this.groups.get(groupName);
    return group?.instances.get(key);
  }

  /**
   * Stores an instance in the specified group
   *
   * @param groupName - The name of the instance group
   * @param key - The key within the group to store the instance under
   * @param instance - The instance value to store
   * @example
   * ```typescript
   * InstanceStorage.setInstance('Repository', 'Users', userRepoInstance);
   * ```
   */
  static setInstance(groupName: string, key: string, instance: InstanceValue): void {
    const group = this.groups.get(groupName);
    if (group) {
      group.instances.set(key, instance);
    }
  }

  /**
   * Stores a lazy recipe (factory) in the specified group
   *
   * The recipe is not executed here; it runs later, on demand, during
   * resolution. Storing a recipe marks the key as lazy.
   *
   * @param groupName - The name of the instance group
   * @param key - The key within the group to store the recipe under
   * @param factory - The factory function that builds the instance
   * @example
   * ```typescript
   * InstanceStorage.setRecipe('Repository', 'Users', () => new UserRepository(db));
   * ```
   */
  static setRecipe(groupName: string, key: string, factory: InstanceFactory): void {
    const group = this.groups.get(groupName);
    if (group) {
      group.recipes.set(key, factory);
    }
  }

  /**
   * Retrieves a lazy recipe (factory) from a group, if one was registered
   *
   * @param groupName - The name of the instance group
   * @param key - The key within the group
   * @returns The factory function, or undefined if the key is not lazy
   */
  static getRecipe(groupName: string, key: string): InstanceFactory | undefined {
    return this.groups.get(groupName)?.recipes.get(key);
  }

  /**
   * Checks whether a key in a group was registered as a lazy recipe
   *
   * @param groupName - The name of the instance group
   * @param key - The key within the group
   * @returns True if the key is a lazy recipe, false otherwise
   */
  static hasRecipe(groupName: string, key: string): boolean {
    return this.groups.get(groupName)?.recipes.has(key) ?? false;
  }

  /**
   * Retrieves all instances from all registered groups
   *
   * This method aggregates instances from all groups into a single map
   * where keys are in the format "GroupName.Key"
   *
   * @returns A map of all instance tokens to their values
   * @example
   * ```typescript
   * const allInstances = InstanceStorage.getAllGroups();
   * allInstances.forEach((instance, token) => {
   *   console.log(`${token}:`, instance);
   * });
   * // Output:
   * // Repository.Users: UserRepository {}
   * // Service.Email: EmailService {}
   * ```
   */
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
