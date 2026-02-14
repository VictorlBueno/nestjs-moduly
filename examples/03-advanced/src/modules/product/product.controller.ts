import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.interface';

@Controller('products')
export class ProductController {
  constructor(private readonly productRepository: IProductRepository) {}

  @Get()
  findAll() {
    return this.productRepository.findAll();
  }

  @Get(':id')
  findById() {
    return this.productRepository.findById('1');
  }

  @Post(':id/image')
  uploadImage() {
    return this.productRepository.uploadImage('1', { data: 'image-data' });
  }

  @Post(':id/queue')
  addToQueue() {
    return this.productRepository.addToQueue('1', 'update');
  }

  @Delete('cache')
  clearCache() {
    return this.productRepository.clearCache();
  }
}
