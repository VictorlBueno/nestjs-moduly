import { createInstanceGroup } from 'nestjs-moduly';
import { ProductRepository } from './repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { S3Service } from './services/s3.service';
import { EmailService } from './services/email.service';
import { Scope } from '@nestjs/common';

export const Database = createInstanceGroup('Database');
export const Cache = createInstanceGroup('Cache');
export const Storage = createInstanceGroup('Storage');
export const Notification = createInstanceGroup('Notification');
export const Repository = createInstanceGroup('Repository');

const primaryDb = new DatabaseService({ name: 'PrimaryDB', type: 'PostgreSQL' });
const replicaDb = new DatabaseService({ name: 'ReplicaDB', type: 'PostgreSQL Replica' });
const redisCache = new CacheService({ host: 'localhost', port: 6379 });
const s3Service = new S3Service({ bucket: 'my-bucket', region: 'us-east-1' });
const emailService = new EmailService({ from: 'noreply@example.com', smtp: 'smtp.example.com' });

Database.Primary = primaryDb;
Database.Replica = replicaDb;
Cache.Redis = redisCache;
Storage.S3 = s3Service;
Notification.Email = emailService;

Database.Primary.scope(Scope.REQUEST);
Database.Replica.scope(Scope.REQUEST);
Cache.Redis.scope(Scope.REQUEST);
Storage.S3.scope(Scope.REQUEST);

Repository.Products = new ProductRepository(primaryDb, redisCache, s3Service);
Repository.Orders = new OrderRepository(primaryDb, replicaDb, emailService, s3Service);