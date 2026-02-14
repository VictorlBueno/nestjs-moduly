import { Module } from '@nestjs/common';
import { Repository } from '../instances';
import { OrderController } from './order.controller';

@Module({
  controllers: [OrderController],
  providers: [
    Repository.Orders,
  ],
  exports: [Repository.Orders],
})
export class OrderModule {}
