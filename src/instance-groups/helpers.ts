import { InstanceValue, ClassType } from '../types';
import { InstanceStorage } from './storage';

/**
 * Gets the injection token for a specific instance in a group
 *
 * The token format is "GroupName.Key" which is used
 * for dependency injection with the @Inject() decorator
 *
 * @param groupName - The name of the instance group
 * @param key - The key within the group to get the token for
 * @returns The injection token string in format "GroupName.Key"
 *
 * @example
 * ```typescript
 * const token = getInjectionToken('Repository', 'Users');
 * console.log(token); // 'Repository.Users'
 *
 * // Usage with @Inject()
 * @Inject('Repository.Users') private userRepo: UserRepository
 * ```
 */
export function getInjectionToken(groupName: string, key: string): string {
  return `${groupName}.${key}`;
}

/**
 * Alias for getInjectionToken() for convenience
 *
 * This function provides the same functionality as getInjectionToken()
 * with a more semantic name when the context is clearly about tokens
 *
 * @param groupName - The name of the instance group
 * @param key - The key within the group to get the token for
 * @returns The injection token string in format "GroupName.Key"
 *
 * @see getInjectionToken
 * @example
 * ```typescript
 * const token = getInstanceToken('Repository', 'Users');
 * console.log(token); // 'Repository.Users'
 * ```
 */
export function getInstanceToken(groupName: string, key: string): string {
  return getInjectionToken(groupName, key);
}

/**
 * Gets the class constructor of an instance
 *
 * This is useful for type checking, reflection,
 * or when you need to create a new instance of the same class
 *
 * @param instance - The instance to get the class constructor from
 * @returns The class constructor of the instance, or undefined if instance has no constructor
 *
 * @example
 * ```typescript
 * const userRepo = new UserRepository();
 * const UserRepoClass = getInstanceClass(userRepo);
 * console.log(UserRepoClass === UserRepository); // true
 *
 * // Useful for reflection
 * console.log(UserRepoClass.name); // 'UserRepository'
 * ```
 */
export function getInstanceClass(instance: InstanceValue): any {
  return instance?.constructor;
}

/**
 * Gets all registered instances from all instance groups
 *
 * This method aggregates every instance from all groups into a single map.
 * The map keys are in the format "GroupName.Key" for easy lookup.
 *
 * @returns A map of injection tokens to their instance values
 *
 * @example
 * ```typescript
 * // Assuming instances were declared:
 * // Repository.Users = new UserRepository()
 * // Service.Email = new EmailService()
 *
 * const allInstances = getAllInstances();
 * allInstances.forEach((instance, token) => {
 *   console.log(`${token}:`, instance);
 * });
 * // Output:
 * // Repository.Users: UserRepository {}
 * // Service.Email: EmailService {}
 * ```
 */
export function getAllInstances(): Map<string, InstanceValue> {
  return InstanceStorage.getAllGroups();
}

/**
 * Converts an instance group to an array of module classes
 *
 * This is useful when you need to import all instances
 * from a specific group at once, such as in @Module({ imports: [...] })
 *
 * @param groupName - The name of the instance group to convert
 * @returns An array of module/wrapper classes from the specified group
 * @throws Returns an empty array if the group doesn't exist
 *
 * @example
 * ```typescript
 * const repositoryModules = instanceGroupToArray('Repository');
 * @Module({
 *   imports: repositoryModules,
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
 * Converts all instance groups to an array of module classes
 *
 * This method collects all instances from all groups and returns them
 * as a flat array for bulk operations
 *
 * @returns An array of all registered module/wrapper classes
 *
 * @example
 * ```typescript
 * const allModules = allInstanceGroupsToArray();
 * @Module({
 *   imports: allModules,
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
