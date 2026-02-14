export interface IProductRepository {
  findAll(): any;
  findById(id: string): any;
  uploadImage(productId: string, imageData: any): any;
  clearCache(): string;
  getDatabaseStatus(): string;
  getCacheStatus(): string;
}
