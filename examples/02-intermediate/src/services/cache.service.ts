export interface CacheConfig {
  host: string;
  port: number;
}

export class CacheService {
  private store = new Map<string, any>();

  constructor(private config: CacheConfig) {}

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
    return `Cache running at ${this.config.host}:${this.config.port}`;
  }
}
