import { Module } from '@nestjs/common';
import { Repository, Storage } from '../../instances';
import { OrderController } from './order.controller';

@Module({
  imports: [
    Repository.Orders,
    Storage.S3,
  ],
  controllers: [OrderController],
})
export class OrderModule {}
