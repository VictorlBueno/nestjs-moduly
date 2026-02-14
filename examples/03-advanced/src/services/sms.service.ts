export class SMSService {
  private messages: Array<{ to: string; message: string; sentAt: string }> = [];

  constructor(config: { provider: string; apiKey: string }) {
    console.log(`SMSService configured with provider: ${config.provider}`);
  }

  send(to: string, message: string) {
    const sms = { to, message, sentAt: new Date().toISOString() };
    this.messages.push(sms);
    return sms;
  }

  getMessages() {
    return this.messages;
  }
}
