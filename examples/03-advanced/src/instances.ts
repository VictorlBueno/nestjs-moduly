import { createInstanceGroup, getInjectionToken, instanceGroupToArray, allInstanceGroupsToArray, getAllInstances } from 'nestjs-moduly';
import { Scope } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { RequestContextService } from './services/request-context.service';
import { TransientCounterService } from './services/transient-counter.service';
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

Repository.Users = new UserRepository(Infrastructure.Logger.useValue, Database.Primary.useValue, Cache.Redis.useValue);
Repository.Products = new ProductRepository(Database.Replica.useValue, Cache.Memcached.useValue);
Repository.RequestTracking = new RequestTrackingRepository(RequestScope.Context.useValue, TransientScope.Counter.useValue);
