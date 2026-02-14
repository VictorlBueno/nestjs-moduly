import { Module } from '@nestjs/common';
import { Repository } from '../instances';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [
    Repository.Products,
  ],
  exports: [Repository.Products],
})
export class ProductModule {}
