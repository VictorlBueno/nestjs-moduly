export interface ICacheService {
  get(key: string): any;
  set(key: string, value: any): void;
  clear(): void;
  getStatus(): string;
}
