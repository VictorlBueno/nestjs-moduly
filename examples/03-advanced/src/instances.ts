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

const logger = new LoggerService();
const primaryDb = new DatabaseService('PrimaryDB');
const replicaDb = new DatabaseService('ReplicaDB');
const redisCache = new CacheService('Redis');
const memcachedCache = new CacheService('Memcached');
const requestContext = new RequestContextService();
const transientCounter = new TransientCounterService();
const s3Service = new S3Service({ bucket: 'my-bucket', region: 'us-east-1' });
const emailService = new EmailService({ from: 'noreply@example.com', smtp: 'smtp.example.com' });
const smsService = new SMSService({ provider: 'twilio', apiKey: 'xxx' });
const ordersQueue = new QueueService({ name: 'orders', type: 'sqs' });
const productsQueue = new QueueService({ name: 'products', type: 'sqs' });
const analyticsTracker = new AnalyticsService({ apiKey: 'analytics-key', endpoint: 'https://analytics.example.com' });
const notificationService = new NotificationService(emailService, smsService);

Infrastructure.Logger = logger;

Database.Primary = primaryDb;
Database.Replica = replicaDb;

Cache.Redis = redisCache;
Cache.Memcached = memcachedCache;

RequestScope.Context = requestContext;

TransientScope.Counter = transientCounter;

Storage.S3 = s3Service;

NotificationEmail.Email = emailService;

NotificationSMS.SMS = smsService;

Queue.Orders = ordersQueue;
Queue.Products = productsQueue;

Analytics.Tracker = analyticsTracker;

Notification.Main = notificationService;

Repository.Users = new UserRepository(logger, primaryDb, redisCache, notificationService, analyticsTracker);
Repository.Products = new ProductRepository(replicaDb, memcachedCache, s3Service, productsQueue, analyticsTracker);
Repository.RequestTracking = new RequestTrackingRepository(requestContext, transientCounter);
