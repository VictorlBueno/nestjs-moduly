export interface IRequestTrackingRepository {
  getRequestId(): string;
  getRequestTimestamp(): number;
  incrementAndGet(): { value: number; requestId: string };
  getCount(): { count: number; requestId: string };
}
