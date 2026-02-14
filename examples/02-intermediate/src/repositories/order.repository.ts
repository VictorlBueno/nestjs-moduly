import { IOrderRepository } from './order.interface';

export class OrderRepository implements IOrderRepository {
  constructor(
    private primaryDb: any,
    private replicaDb: any,
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
}
