import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrderRepository } from '../../repositories/order.repository';
import { S3Service } from '../../services/s3.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly s3Service: S3Service,
  ) {}

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

  @Post(':id/confirm-email')
  sendConfirmationEmail(@Param('id') id: string, @Body() body: { customerEmail: string }) {
    return this.orderRepository.sendOrderConfirmationEmail(id, body.customerEmail);
  }

  @Post(':id/export')
  exportToS3(@Param('id') id: string) {
    const order = this.orderRepository.getOrder(id);
    return this.s3Service.upload(`orders/${id}/export.json`, order);
  }
}
