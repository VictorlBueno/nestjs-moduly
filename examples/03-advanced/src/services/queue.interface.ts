export interface IQueueService {
  enqueue(queueName: string, data: any): any;
  dequeue(queueName: string): any;
  getQueueSize(queueName: string): number;
}
