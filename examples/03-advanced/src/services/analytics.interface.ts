export interface IAnalyticsService {
  track(event: string, data: any): any;
  getEvents(): Array<{ event: string; data: any; timestamp: string }>;
  getEventCount(event: string): number;
}
