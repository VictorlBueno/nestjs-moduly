import { IUserRepository } from './user.interface';

export class UserRepository implements IUserRepository {
  constructor(
    private logger: any,
    private primaryDb: any,
    private redisCache: any,
    private notification: any,
    private analytics: any,
  ) {}

  findAll() {
    this.logger.log('Finding all users');
    this.analytics.track('users.findAll', { count: 0 });
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
    this.analytics.track('users.findOne', { userId: id });
    return this.primaryDb.query(`SELECT * FROM users WHERE id = ${id}`);
  }

  create(user: any) {
    this.logger.log('Creating new user');
    this.analytics.track('users.create', { email: user.email });
    const result = this.primaryDb.query(`INSERT INTO users ...`);
    this.notification.sendNotification(user.id, 'Welcome to our platform!', 'email');
    return result;
  }

  getUserLogs() {
    return this.logger.getLogs();
  }

  clearLogs() {
    this.logger.clearLogs();
    return 'Logs cleared';
  }
}
