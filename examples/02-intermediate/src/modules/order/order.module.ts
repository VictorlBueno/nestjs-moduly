import { Module } from '@nestjs/common';
import { Repository, Storage } from '../../instances';
import { OrderController } from './order.controller';

@Module({
  controllers: [OrderController],
  providers: [
    Repository.Orders,
    Storage.S3,
  ],
  exports: [Repository.Orders],
})
export class OrderModule {}
