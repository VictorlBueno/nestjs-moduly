export interface DatabaseConfig {
  name: string;
  type: string;
}

export class DatabaseService {
  constructor(private config: DatabaseConfig) {}

  connect(): string {
    return `Connected to ${this.config.name} (${this.config.type})`;
  }

  query(sql: string): any[] {
    return [{ id: 1, data: 'Result from ' + this.config.name }];
  }
}
