import { Module } from '@nestjs/common';

export type AnyModule = new (...args: any[]) => any;

export interface ModuleGroup {
  [key: string]: AnyModule;
}

export class ModuleSimplifier {
  private static groups: Map<string, ModuleGroup> = new Map();

  static createGroup(name: string): ModuleGroup {
    const group = {};
    this.groups.set(name, group);
    return group;
  }

  static getGroup(name: string): ModuleGroup {
    const group = this.groups.get(name);
    if (!group) {
      throw new Error(`Module group '${name}' not found`);
    }
    return group;
  }

  static register(groupName: string, moduleName: string, module: AnyModule): void {
    const group = this.groups.get(groupName);
    if (!group) {
      this.createGroup(groupName);
    }
    (this.groups.get(groupName) as any)[moduleName] = module;
  }

  static toArray(groupName: string): AnyModule[] {
    const group = this.getGroup(groupName);
    return Object.values(group);
  }

  static getAll(): AnyModule[] {
    const allModules: AnyModule[] = [];
    this.groups.forEach((group) => {
      allModules.push(...Object.values(group));
    });
    return allModules;
  }
}

export function createModuleGroup(name: string): ModuleGroup {
  return ModuleSimplifier.createGroup(name);
}
