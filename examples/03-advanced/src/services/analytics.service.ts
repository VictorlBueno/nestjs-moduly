export class AnalyticsService {
  private events: Array<{ event: string; data: any; timestamp: string }> = [];

  constructor(config: { apiKey: string; endpoint: string }) {
    console.log(`AnalyticsService configured with endpoint: ${config.endpoint}`);
  }

  track(event: string, data: any) {
    const eventData = { event, data, timestamp: new Date().toISOString() };
    this.events.push(eventData);
    return eventData;
  }

  getEvents() {
    return this.events;
  }

  getEventCount(event: string) {
    return this.events.filter(e => e.event === event).length;
  }
}
