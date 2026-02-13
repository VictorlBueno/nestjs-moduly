export type ClassType<T = any> = new (...args: any[]) => T;

export type InstanceValue = any;

export interface ProviderObject {
  provide: string | symbol;
  useValue: InstanceValue;
}

export interface InstanceGroup {
  [key: string]: ClassType & ProviderObject;
}

export interface InstanceGroupOptions {
  tokenPrefix?: string;
  global?: boolean;
  useClassAsToken?: boolean;
}

export type AnyModule = new (...args: any[]) => any;

export interface ModuleGroup {
  [key: string]: AnyModule;
}
