import { InstanceValue, ClassType } from '../types';
import { InstanceStorage } from './storage';

export function getInjectionToken(groupName: string, key: string): string {
  return `${groupName}.${key}`;
}

export function getInstanceToken(groupName: string, key: string): string {
  return getInjectionToken(groupName, key);
}

export function getInstanceClass(instance: InstanceValue): any {
  return instance?.constructor;
}

export function getAllInstances(): Map<string, InstanceValue> {
  return InstanceStorage.getAllGroups();
}

export function instanceGroupToArray(groupName: string): ClassType[] {
  const group = InstanceStorage.getGroup(groupName);
  if (!group) {
    return [];
  }
  return Object.values(group.group);
}

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
