import { createInstanceGroup } from 'nestjs-moduly';
import { ProductRepository } from './repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { S3Service } from './services/s3.service';
import { EmailService } from './services/email.service';
import {Scope} from "@nestjs/common";

export const Database = createInstanceGroup('Database');
export const Cache = createInstanceGroup('Cache');
export const Storage = createInstanceGroup('Storage');
export const Notification = createInstanceGroup('Notification');
export const Repository = createInstanceGroup('Repository');

Database.Primary = new DatabaseService({ name: 'PrimaryDB', type: 'PostgreSQL' });
Database.Replica = new DatabaseService({ name: 'ReplicaDB', type: 'PostgreSQL Replica' });
Cache.Redis = new CacheService({ host: 'localhost', port: 6379 });
Storage.S3 = new S3Service({ bucket: 'my-bucket', region: 'us-east-1' });
Notification.Email = new EmailService({ from: 'noreply@example.com', smtp: 'smtp.example.com' });

Database.Primary.scope(Scope.REQUEST);
Database.Replica.scope(Scope.REQUEST);
Cache.Redis.scope(Scope.REQUEST);
Storage.S3.scope(Scope.REQUEST);
Repository.Products = new ProductRepository(Database.Primary, Cache.Redis, Storage.S3);
Repository.Orders = new OrderRepository(Database.Primary, Database.Replica, Notification.Email, Storage.S3);

