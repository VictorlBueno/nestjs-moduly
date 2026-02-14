export interface IOrderRepository {
  createOrder(orderData: any): any;
  getOrder(id: string): any;
  getAllOrders(): any;
  sendOrderConfirmationEmail(orderId: string, customerEmail: string): any;
  exportOrderToS3(orderId: string, orderData: any): any;
}
