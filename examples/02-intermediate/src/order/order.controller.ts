import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IOrderRepository } from '../repositories/order.interface';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderRepository: IOrderRepository) {}

  @Get()
  getAllOrders() {
    return this.orderRepository.getAllOrders();
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderRepository.getOrder(id);
  }

  @Post()
  createOrder(@Body() body: any) {
    return this.orderRepository.createOrder(body);
  }
}
