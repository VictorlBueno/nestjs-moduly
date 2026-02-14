import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ProductRepository } from '../../repositories/product.repository';
import { EmailService } from '../../services/email.service';

@Controller('products')
export class ProductController {
  constructor(
      private readonly productRepository: ProductRepository,
      private readonly emailService: EmailService
  ) {}

  @Get()
  findAll() {
    return this.productRepository.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productRepository.findById(id);
  }

  @Post(':id/image')
  uploadImage(@Param('id') id: string, @Body() body: { imageData: any }) {
    const result = this.productRepository.uploadImage(id, body.imageData);
    this.emailService.send('admin@example.com', 'Product Image Uploaded', `Product ${id} image uploaded`);
    return result;
  }

  @Delete('cache')
  clearCache() {
    return this.productRepository.clearCache();
  }

  @Get('status')
  getStatus() {
    return {
      database: this.productRepository.getDatabaseStatus(),
      cache: this.productRepository.getCacheStatus(),
    };
  }
}
