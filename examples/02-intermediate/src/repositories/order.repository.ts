import { IOrderRepository } from './order.interface';

export class OrderRepository implements IOrderRepository {
  constructor(
    private primaryDb: any,
    private replicaDb: any,
    private email: any,
    private s3: any,
  ) {}

  createOrder(orderData: any) {
    return {
      write: this.primaryDb.connect(),
      read: this.replicaDb.connect(),
      order: orderData,
    };
  }

  getOrder(id: string) {
    return this.replicaDb.query(`SELECT * FROM orders WHERE id = ${id}`);
  }

  getAllOrders() {
    return this.replicaDb.query('SELECT * FROM orders');
  }

  sendOrderConfirmationEmail(orderId: string, customerEmail: string) {
    return this.email.send(customerEmail, `Order Confirmation #${orderId}`, 'Your order has been confirmed!');
  }

  exportOrderToS3(orderId: string, orderData: any) {
    const key = `orders/${orderId}/export.json`;
    return this.s3.upload(key, orderData);
  }
}
