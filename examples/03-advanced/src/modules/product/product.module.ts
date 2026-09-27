import { Module } from '@nestjs/common';
import { Repository } from '../../instances';
import { ProductController } from './product.controller';

@Module({
  imports: [Repository.Products],
  controllers: [ProductController],
})
export class ProductModule {}
