import { createInstanceGroup } from 'nestjs-moduly';
import { QueueService } from '../services/queue.service';

export const Queue = createInstanceGroup('Queue', {
  useClassAsToken: false,
});

Queue.Orders = () => new QueueService({ name: 'orders', type: 'sqs' });
Queue.Products = () => new QueueService({ name: 'products', type: 'sqs' });
