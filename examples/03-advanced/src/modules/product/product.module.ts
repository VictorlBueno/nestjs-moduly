import { Module } from '@nestjs/common';
import { Repository, Cache, Storage, Queue } from '../../instances';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [
    Repository.Products,
    Cache.Memcached,
    Storage.S3,
    Queue.Products,
  ],
  exports: [Repository.Products],
})
export class ProductModule {}
