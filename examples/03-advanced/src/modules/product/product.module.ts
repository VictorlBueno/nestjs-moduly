import { Module } from '@nestjs/common';
import { Repository, Cache, Storage, Queue } from '../../instances';
import { ProductController } from './product.controller';

@Module({
  imports: [
    Repository.Products,
    Cache.Memcached,
    Storage.S3,
    Queue.Products,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
