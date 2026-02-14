import { IProductRepository } from './product.interface';

export class ProductRepository implements IProductRepository {
  constructor(
    private replicaDb: any,
    private memcachedCache: any,
  ) {}

  findAll() {
    const cached = this.memcachedCache.get('products');
    if (cached) {
      return { source: 'memcached', data: cached };
    }

    const result = this.replicaDb.query('SELECT * FROM products');
    this.memcachedCache.set('products', result);
    return { source: 'replica-db', data: result };
  }

  clearCache() {
    this.memcachedCache.clear();
    return 'Memcached cache cleared';
  }
}
