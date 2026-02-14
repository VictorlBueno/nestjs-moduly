export class CacheService {
  private store = new Map<string, any>();

  constructor(private name: string) {}

  set(key: string, value: any): void {
    this.store.set(key, value);
  }

  get(key: string): any {
    return this.store.get(key);
  }

  clear(): void {
    this.store.clear();
  }

  getStatus(): string {
    return `${this.name} running`;
  }
}
