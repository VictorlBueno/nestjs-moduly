import { IProductRepository } from './product.interface';

export class ProductRepository implements IProductRepository {
  constructor(
    private primaryDb: any,
    private cache: any,
    private s3: any,
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

  findById(id: string) {
    return this.primaryDb.query(`SELECT * FROM products WHERE id = ${id}`);
  }

  uploadImage(productId: string, imageData: any) {
    const key = `products/${productId}/image.jpg`;
    return this.s3.upload(key, imageData);
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
