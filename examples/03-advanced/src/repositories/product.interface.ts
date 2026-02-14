export interface IProductRepository {
  findAll(): any;
  findById(id: string): any;
  uploadImage(productId: string, imageData: any): any;
  addToQueue(productId: string, action: string): any;
  clearCache(): string;
}
