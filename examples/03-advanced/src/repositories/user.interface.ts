export interface IUserRepository {
  findAll(): any;
  findOne(id: string): any;
  create(user: any): any;
  getUserLogs(): string[];
  clearLogs(): string;
}
