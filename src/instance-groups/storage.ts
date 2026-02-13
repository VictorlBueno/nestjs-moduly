import { InstanceGroup, InstanceGroupOptions, InstanceValue } from '../types';

export class InstanceStorage {
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
