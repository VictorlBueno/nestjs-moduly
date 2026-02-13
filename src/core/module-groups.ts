import { ModuleGroup, AnyModule } from '../types';

/**
 * Simplifier for managing NestJS module groups
 *
 * This class provides methods to create, retrieve, and manage
 * module groups, allowing you to organize your NestJS modules
 * by feature or layer for cleaner imports
 *
 * @example
 * ```typescript
 * export const Repository = createModuleGroup('Repository');
 * export const Service = createModuleGroup('Service');
 *
 * Repository.Users = UsersModule;
 * Service.Email = EmailService;
 *
 * @Module({ imports: [Repository.Users, Service.Email] })
 * export class AppModule {}
 * ```
 */
export class ModuleSimplifier {
  /**
   * Internal storage for all module groups
   *
   * Maps group names to their module group objects
   * containing named references to module classes
   */
  private static groups: Map<string, ModuleGroup> = new Map();

  /**
   * Creates a new module group with the specified name
   *
   * A module group is an object where each property represents
   * a named reference to a NestJS module class
   *
   * @param name - The name of the module group to create
   * @returns A new module group object with empty properties
   *
   * @example
   * ```typescript
   * const Repository = ModuleSimplifier.createGroup('Repository');
   * Repository.Users = UsersModule;
   * Repository.Products = ProductsModule;
   * ```
   */
  static createGroup(name: string): ModuleGroup {
    const group = {};
    this.groups.set(name, group);
    return group;
  }

  /**
   * Retrieves a module group by name
   *
   * @param name - The name of the module group to retrieve
   * @returns The module group containing registered modules
   * @throws {Error} When the group name is not found
   *
   * @example
   * ```typescript
   * const Repository = ModuleSimplifier.getGroup('Repository');
   * console.log(Repository.Users); // UsersModule class
   * ```
   */
  static getGroup(name: string): ModuleGroup {
    const group = this.groups.get(name);
    if (!group) {
      throw new Error(`Module group '${name}' not found`);
    }
    return group;
  }

  /**
   * Registers a module in a specific group
   *
   * If the group doesn't exist, it will be created automatically.
   * This allows you to register modules without explicitly creating groups first.
   *
   * @param groupName - The name of the module group to register the module in
   * @param moduleName - The name/key to assign to the module in the group
   * @param module - The NestJS module class to register
   *
   * @example
   * ```typescript
   * ModuleSimplifier.register('Repository', 'Users', UsersModule);
   * // Equivalent to:
   * const Repository = ModuleSimplifier.getGroup('Repository');
   * Repository.Users = UsersModule;
   * ```
   */
  static register(groupName: string, moduleName: string, module: AnyModule): void {
    const group = this.groups.get(groupName);
    if (!group) {
      this.createGroup(groupName);
    }
    (this.groups.get(groupName) as any)[moduleName] = module;
  }

  /**
   * Converts a module group to an array of module classes
   *
   * This is useful when you need to import all modules
   * from a specific group at once
   *
   * @param groupName - The name of the module group to convert
   * @returns An array of module classes from the specified group
   * @throws Returns an empty array if the group doesn't exist
   *
   * @example
   * ```typescript
   * const repositoryModules = ModuleSimplifier.toArray('Repository');
   * @Module({
   *   imports: repositoryModules,
   * })
   * export class AppModule {}
   * ```
   */
  static toArray(groupName: string): AnyModule[] {
    const group = this.getGroup(groupName);
    return Object.values(group);
  }

  /**
   * Gets all modules from all registered groups as a flat array
   *
   * This method collects every module from all groups and returns them
   * in a single array for bulk operations
   *
   * @returns An array of all registered module classes
   *
   * @example
   * ```typescript
 * const allModules = ModuleSimplifier.getAll();
 * @Module({
 *   imports: allModules,
 * })
 * export class AppModule {}
 * ```
 */
  static getAll(): AnyModule[] {
    const allModules: AnyModule[] = [];
    this.groups.forEach((group) => {
      allModules.push(...Object.values(group));
    });
    return allModules;
  }
}

/**
 * Creates a module group for organizing NestJS modules
 *
 * This is a convenience function that wraps ModuleSimplifier.createGroup()
 * with a simpler API for creating module groups
 *
 * @param name - The name of the module group to create
 * @returns A new module group object
 *
 * @example
 * ```typescript
 * export const Repository = createModuleGroup('Repository');
 * export const Service = createModuleGroup('Service');
 *
 * Repository.Users = UsersModule;
 * Service.Email = EmailService;
 *
 * @Module({ imports: [Repository.Users, Service.Email] })
 * export class AppModule {}
 * ```
 */
export function createModuleGroup(name: string): ModuleGroup {
  return ModuleSimplifier.createGroup(name);
}
