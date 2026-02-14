export class DatabaseService {
  private queries: string[] = [];

  constructor(private name: string) {}

  connect(): string {
    return `Connected to ${this.name}`;
  }

  query(sql: string): any[] {
    this.queries.push(sql);
    return [{ id: 1, result: 'Query executed on ' + this.name }];
  }

  getQueries(): string[] {
    return this.queries;
  }
}
