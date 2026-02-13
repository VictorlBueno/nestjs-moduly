import { InstanceGroup, InstanceGroupOptions, InstanceValue } from '../types';

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
