import { Module } from '@nestjs/common';
import { Notification, Repository } from '../../instances';
import { ProductController } from './product.controller';

@Module({
  imports: [
    Repository.Products,
    Notification.Email,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
