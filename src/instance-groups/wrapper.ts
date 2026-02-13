import { Module, DynamicModule } from '@nestjs/common';
import { ClassType, InstanceValue, InstanceGroupOptions, ProviderObject } from '../types';

export function createWrapperModule(
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

  Object.defineProperty(WrapperModule, 'instanceClass', {
    value: instance?.constructor,
    enumerable: true,
    writable: false,
  });

  return WrapperModule as unknown as ClassType & ProviderObject;
}
