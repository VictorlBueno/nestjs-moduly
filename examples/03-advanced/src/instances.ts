import { createInstanceGroup, getInjectionToken, instanceGroupToArray, allInstanceGroupsToArray, getAllInstances } from 'nestjs-moduly';
import { Scope } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { RequestContextService } from './services/request-context.service';
import { TransientCounterService } from './services/transient-counter.service';
import { S3Service } from './services/s3.service';
import { EmailService } from './services/email.service';
import { QueueService } from './services/queue.service';
import { SMSService } from './services/sms.service';
import { AnalyticsService } from './services/analytics.service';
import { NotificationService } from './services/notification.service';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository } from './repositories/product.repository';
import { RequestTrackingRepository } from './repositories/request-tracking.repository';

export { getInjectionToken, instanceGroupToArray, allInstanceGroupsToArray, getAllInstances };

export const Infrastructure = createInstanceGroup('Infrastructure', {
  global: true,
  useClassAsToken: true,
});

export const Database = createInstanceGroup('Database', {
  global: false,
  useClassAsToken: true,
});

export const Cache = createInstanceGroup('Cache', {
  global: false,
  useClassAsToken: true,
});

export const RequestScope = createInstanceGroup('RequestScope', {
  global: false,
  useClassAsToken: true,
  scope: Scope.REQUEST,
});

export const TransientScope = createInstanceGroup('TransientScope', {
  global: false,
  useClassAsToken: true,
  scope: Scope.TRANSIENT,
});

export const Storage = createInstanceGroup('Storage', {
  global: false,
  useClassAsToken: true,
});

export const NotificationEmail = createInstanceGroup('NotificationEmail', {
  global: false,
  useClassAsToken: true,
});

export const NotificationSMS = createInstanceGroup('NotificationSMS', {
  global: false,
  useClassAsToken: true,
});

export const Queue = createInstanceGroup('Queue', {
  global: false,
  useClassAsToken: true,
});

export const Analytics = createInstanceGroup('Analytics', {
  global: false,
  useClassAsToken: true,
});

export const Notification = createInstanceGroup('Notification', {
  global: false,
  useClassAsToken: true,
});

export const Repository = createInstanceGroup('Repository', {
  global: false,
  useClassAsToken: true,
});

Infrastructure.Logger = new LoggerService();

Database.Primary = new DatabaseService('PrimaryDB');
Database.Replica = new DatabaseService('ReplicaDB');

Cache.Redis = new CacheService('Redis');
Cache.Memcached = new CacheService('Memcached');

RequestScope.Context = new RequestContextService();

TransientScope.Counter = new TransientCounterService();

Storage.S3 = new S3Service({ bucket: 'my-bucket', region: 'us-east-1' });

NotificationEmail.Email = new EmailService({ from: 'noreply@example.com', smtp: 'smtp.example.com' });

NotificationSMS.SMS = new SMSService({ provider: 'twilio', apiKey: 'xxx' });

Queue.Orders = new QueueService({ name: 'orders', type: 'sqs' });
Queue.Products = new QueueService({ name: 'products', type: 'sqs' });

Analytics.Tracker = new AnalyticsService({ apiKey: 'analytics-key', endpoint: 'https://analytics.example.com' });

Notification.Main = new NotificationService(NotificationEmail.Email, NotificationSMS.SMS);

Repository.Users = new UserRepository(Infrastructure.Logger, Database.Primary, Cache.Redis, Notification.Main, Analytics.Tracker);
Repository.Products = new ProductRepository(Database.Replica, Cache.Memcached, Storage.S3, Queue.Products, Analytics.Tracker);
Repository.RequestTracking = new RequestTrackingRepository(RequestScope.Context, TransientScope.Counter);
