import { createInstanceGroup } from 'nestjs-moduly';
import { ProductRepository } from './repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';

export const Database = createInstanceGroup('Database');
export const Cache = createInstanceGroup('Cache');
export const Repository = createInstanceGroup('Repository');

Database.Primary = new DatabaseService({ name: 'PrimaryDB', type: 'PostgreSQL' });
Database.Replica = new DatabaseService({ name: 'ReplicaDB', type: 'PostgreSQL Replica' });
Cache.Redis = new CacheService({ host: 'localhost', port: 6379 });

Repository.Products = new ProductRepository(Database.Primary, Cache.Redis);
Repository.Orders = new OrderRepository(Database.Primary, Database.Replica);

Database.Primary.scope('default' as any);
Database.Replica.scope('default' as any);
Cache.Redis.scope('default' as any);
