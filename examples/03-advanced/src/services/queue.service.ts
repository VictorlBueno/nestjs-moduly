export class QueueService {
  private queues: Map<string, Array<{ data: any; enqueuedAt: string }>> = new Map();

  constructor(config: { name: string; type: string }) {
    this.queues.set(config.name, []);
  }

  enqueue(queueName: string, data: any) {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    const queue = this.queues.get(queueName)!;
    const message = { data, enqueuedAt: new Date().toISOString() };
    queue.push(message);
    return { queueName, messageId: queue.length };
  }

  dequeue(queueName: string) {
    if (!this.queues.has(queueName)) {
      return null;
    }
    const queue = this.queues.get(queueName)!;
    return queue.shift() || null;
  }

  getQueueSize(queueName: string) {
    const queue = this.queues.get(queueName);
    return queue ? queue.length : 0;
  }
}
