export interface IProductRepository {
  findAll(): any;
  clearCache(): string;
  getDatabaseStatus(): string;
  getCacheStatus(): string;
}
