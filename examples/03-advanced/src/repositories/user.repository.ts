import { IUserRepository } from './user.interface';

export class UserRepository implements IUserRepository {
  constructor(
    private logger: any,
    private primaryDb: any,
    private redisCache: any,
  ) {}

  findAll() {
    this.logger.log('Finding all users');
    const cached = this.redisCache.get('users');
    if (cached) {
      this.logger.log('Users retrieved from cache');
      return cached;
    }

    const result = this.primaryDb.query('SELECT * FROM users');
    this.redisCache.set('users', result);
    this.logger.log('Users retrieved from database and cached');
    return result;
  }

  findOne(id: string) {
    this.logger.log(`Finding user with id: ${id}`);
    return this.primaryDb.query(`SELECT * FROM users WHERE id = ${id}`);
  }

  getUserLogs() {
    return this.logger.getLogs();
  }

  clearLogs() {
    this.logger.clearLogs();
    return 'Logs cleared';
  }
}
