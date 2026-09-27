import { createInstanceGroup } from 'nestjs-moduly';
import { UserRepository } from '../repositories/user.repository';
import { ProductRepository } from '../repositories/product.repository';
import { RequestTrackingRepository } from '../repositories/request-tracking.repository';

import { Infrastructure } from './infrastructure';
import { Database } from './database';
import { Cache } from './cache';
import { Storage } from './storage';
import { Queue } from './queue';
import { Notification } from './notification';
import { Analytics } from './analytics';
import { Context } from './context';

export const Repository = createInstanceGroup('Repository', {
  useClassAsToken: true,
});

Repository.Users = () =>
  new UserRepository(
    Infrastructure.Logger,
    Database.Primary,
    Cache.Redis,
    Notification.Main,
    Analytics.Tracker,
  );

Repository.Products = () =>
  new ProductRepository(
    Database.Replica,
    Cache.Memcached,
    Storage.S3,
    Queue.Products,
    Analytics.Tracker,
  );

Repository.RequestTracking = () =>
  new RequestTrackingRepository(Context.Request, Context.Counter);
