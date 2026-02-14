import { Controller, Get, Delete } from '@nestjs/common';
import { IProductRepository } from '../repositories/product.interface';

@Controller('products')
export class ProductController {
  constructor(private readonly productRepository: IProductRepository) {}

  @Get()
  findAll() {
    return this.productRepository.findAll();
  }

  @Delete('cache')
  clearCache() {
    return this.productRepository.clearCache();
  }
}
