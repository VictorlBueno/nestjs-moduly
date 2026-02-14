export class Database {
  constructor(private config: { host: string; port: number }) {}

  connect(): string {
    return `Connected to ${this.config.host}:${this.config.port}`;
  }
}
