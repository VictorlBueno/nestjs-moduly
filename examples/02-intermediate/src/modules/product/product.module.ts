import { Module } from '@nestjs/common';
import {Notification, Repository} from '../../instances';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [
    Repository.Products,
    Notification.Email
  ],
  exports: [Repository.Products],
})
export class ProductModule {}
