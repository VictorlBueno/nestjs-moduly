export class RequestContextService {
  private requestId: string;
  private timestamp: number;

  constructor() {
    this.requestId = Math.random().toString(36).substring(7);
    this.timestamp = Date.now();
  }

  getId(): string {
    return this.requestId;
  }

  getTimestamp(): number {
    return this.timestamp;
  }
}
