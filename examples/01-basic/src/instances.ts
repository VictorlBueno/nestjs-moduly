import { createInstanceGroup } from 'nestjs-moduly';
import { UserRepository } from './repositories/user.repository';
import { Database } from './services/database';

export const Repository = createInstanceGroup('Repository');

const database = new Database({ host: 'localhost', port: 5432 });
Repository.Users = new UserRepository(database);
