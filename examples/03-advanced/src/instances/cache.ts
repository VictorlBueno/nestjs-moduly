import { createInstanceGroup } from 'nestjs-moduly';
import { CacheService } from '../services/cache.service';

export const Cache = createInstanceGroup('Cache', {
  useClassAsToken: false,
});

Cache.Redis = () => new CacheService('Redis');
Cache.Memcached = () => new CacheService('Memcached');
