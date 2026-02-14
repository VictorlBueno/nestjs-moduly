import { IRequestTrackingRepository } from './request-tracking.interface';

export class RequestTrackingRepository implements IRequestTrackingRepository {
  constructor(
    private requestContext: any,
    private transientCounter: any,
  ) {}

  getRequestId(): string {
    return this.requestContext.getId();
  }

  getRequestTimestamp(): number {
    return this.requestContext.getTimestamp();
  }

  incrementAndGet(): { value: number; requestId: string } {
    const value = this.transientCounter.increment();
    return { value, requestId: this.getRequestId() };
  }

  getCount(): { count: number; requestId: string } {
    return { count: this.transientCounter.getCount(), requestId: this.getRequestId() };
  }
}
