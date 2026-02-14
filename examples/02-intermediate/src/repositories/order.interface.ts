export interface IOrderRepository {
  createOrder(orderData: any): any;
  getOrder(id: string): any;
  getAllOrders(): any;
}
