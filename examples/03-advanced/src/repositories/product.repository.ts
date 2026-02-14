import { IProductRepository } from './product.interface';

export class ProductRepository implements IProductRepository {
  constructor(
    private replicaDb: any,
    private memcachedCache: any,
    private s3: any,
    private queue: any,
    private analytics: any,
  ) {}

  findAll() {
    this.analytics.track('products.findAll', {});
    const cached = this.memcachedCache.get('products');
    if (cached) {
      return { source: 'memcached', data: cached };
    }

    const result = this.replicaDb.query('SELECT * FROM products');
    this.memcachedCache.set('products', result);
    return { source: 'replica-db', data: result };
  }

  findById(id: string) {
    this.analytics.track('products.findById', { productId: id });
    return this.replicaDb.query(`SELECT * FROM products WHERE id = ${id}`);
  }

  uploadImage(productId: string, imageData: any) {
    const key = `products/${productId}/image.jpg`;
    const result = this.s3.upload(key, imageData);
    this.analytics.track('products.imageUploaded', { productId, key });
    return result;
  }

  addToQueue(productId: string, action: string) {
    return this.queue.enqueue('products', { productId, action, timestamp: new Date().toISOString() });
  }

  clearCache() {
    this.memcachedCache.clear();
    return 'Memcached cache cleared';
  }
}
