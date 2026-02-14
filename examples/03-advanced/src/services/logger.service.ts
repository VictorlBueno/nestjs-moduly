export class LoggerService {
  private logs: string[] = [];

  log(message: string): void {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
    console.log(`[Logger] ${message}`);
  }

  getLogs(): string[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}
