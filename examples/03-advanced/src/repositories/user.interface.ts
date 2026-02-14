export interface IUserRepository {
  findAll(): any;
  findOne(id: string): any;
  getUserLogs(): string[];
  clearLogs(): string;
}
