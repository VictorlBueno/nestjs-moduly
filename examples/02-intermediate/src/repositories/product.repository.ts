import { IProductRepository } from './product.interface';

export class ProductRepository implements IProductRepository {
  constructor(
    private primaryDb: any,
    private cache: any,
  ) {}

  findAll() {
    const cached = this.cache.get('products');
    if (cached) {
      return { source: 'cache', data: cached };
    }

    const result = this.primaryDb.query('SELECT * FROM products');
    this.cache.set('products', result);
    return { source: 'database', data: result };
  }

  clearCache() {
    this.cache.clear();
    return 'Cache cleared';
  }

  getDatabaseStatus() {
    return this.primaryDb.connect();
  }

  getCacheStatus() {
    return this.cache.getStatus();
  }
}
