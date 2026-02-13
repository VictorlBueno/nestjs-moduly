import { InstanceGroup, InstanceGroupOptions, InstanceValue, ClassType } from '../types';
import { InstanceStorage } from './storage';
import { createWrapperModule } from './wrapper';

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
