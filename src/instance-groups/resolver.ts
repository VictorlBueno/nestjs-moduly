import { InstanceStorage } from './storage';

/**
 * Resolves lazy recipes on demand, in dependency order
 *
 * When an instance group property is assigned a function (a recipe), the
 * instance is not built immediately. Instead, it is built the first time it
 * is resolved — either because its wrapper module is imported by NestJS, or
 * because another recipe references it.
 *
 * **Responsibilities:**
 *
 * 1. **Lazy execution:** A recipe runs only when its instance is actually needed.
 * 2. **Automatic ordering:** Referencing `Database.Primary` inside a recipe
 *    triggers the resolution of `Database.Primary` first, so declaration order
 *    in the instances file does not matter.
 * 3. **Memoization (singleton):** Each recipe runs at most once; the result is
 *    cached and shared across the whole application.
 * 4. **Cycle detection:** A recipe that (transitively) depends on itself throws
 *    a clear error instead of overflowing the stack.
 *
 * The resolution context is tracked with a depth counter so that instance group
 * proxies know when a property read should return the resolved instance (during
 * resolution) rather than the wrapper module (everywhere else).
 *
 * @internal
 */
export class InstanceResolver {
  /**
   * Memoized instances, keyed by their token ("GroupName.Key")
   */
  private static resolved = new Map<string, unknown>();

  /**
   * Tokens currently being resolved, used to detect circular dependencies
   */
  private static resolving = new Set<string>();

  /**
   * Depth of the current resolution context
   *
   * Greater than zero while a recipe is executing. Instance group proxies use
   * this to decide whether a property read resolves to the instance.
   */
  private static depth = 0;

  /**
   * Whether the resolver is currently building an instance
   *
   * @returns True while inside a recipe execution, false otherwise
   */
  static isResolving(): boolean {
    return this.depth > 0;
  }

  /**
   * Resolves the instance for a group key, building it if necessary
   *
   * If the key is a lazy recipe, the recipe runs (once) and its result is
   * memoized. If the key holds an eager value, that value is returned as-is.
   *
   * @param groupName - The name of the instance group
   * @param key - The key within the group
   * @returns The resolved instance (or eager value), or undefined if unknown
   * @throws {Error} When a circular dependency is detected
   */
  static resolve(groupName: string, key: string): unknown {
    const token = `${groupName}.${key}`;

    if (this.resolved.has(token)) {
      return this.resolved.get(token);
    }

    // Not a lazy recipe: return the eager value (or undefined if not set).
    if (!InstanceStorage.hasRecipe(groupName, key)) {
      return InstanceStorage.getInstance(groupName, key);
    }

    if (this.resolving.has(token)) {
      const chain = [...this.resolving, token].join(' -> ');
      throw new Error(
        `[nestjs-moduly] Circular dependency detected while resolving lazy instances: ${chain}`
      );
    }

    const recipe = InstanceStorage.getRecipe(groupName, key)!;

    this.resolving.add(token);
    this.depth++;
    try {
      const instance = recipe();
      this.resolved.set(token, instance);
      // Mirror into the instance map so helpers like getAllInstances() see it.
      InstanceStorage.setInstance(groupName, key, instance);
      return instance;
    } finally {
      this.depth--;
      this.resolving.delete(token);
    }
  }

  /**
   * Runs a recipe fresh, WITHOUT memoizing the result
   *
   * Used by scoped providers (REQUEST/TRANSIENT), where NestJS calls the
   * factory again for each request/injection, so the instance must not be
   * cached. Dependencies referenced inside the recipe are still resolved through
   * {@link resolve} (so singletons stay shared). Runs inside a resolution
   * context and detects cycles, just like {@link resolve}.
   *
   * @param groupName - The name of the instance group
   * @param key - The key within the group
   * @returns A brand-new instance (or the eager value if the key is not lazy)
   * @throws {Error} When a circular dependency is detected
   */
  static build(groupName: string, key: string): unknown {
    const token = `${groupName}.${key}`;

    if (!InstanceStorage.hasRecipe(groupName, key)) {
      return InstanceStorage.getInstance(groupName, key);
    }

    if (this.resolving.has(token)) {
      const chain = [...this.resolving, token].join(' -> ');
      throw new Error(
        `[nestjs-moduly] Circular dependency detected while resolving lazy instances: ${chain}`
      );
    }

    const recipe = InstanceStorage.getRecipe(groupName, key)!;

    this.resolving.add(token);
    this.depth++;
    try {
      return recipe();
    } finally {
      this.depth--;
      this.resolving.delete(token);
    }
  }

  /**
   * Clears all resolved instances and resolution state
   *
   * Useful in tests that build and tear down multiple application instances
   * within the same process.
   */
  static reset(): void {
    this.resolved.clear();
    this.resolving.clear();
    this.depth = 0;
  }
}
