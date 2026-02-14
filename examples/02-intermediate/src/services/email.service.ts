export class EmailService {
  private emails: Array<{ to: string; subject: string; body: string; sentAt: string }> = [];

  constructor(config: { from: string; smtp: string }) {
    console.log(`EmailService configured with from: ${config.from}, smtp: ${config.smtp}`);
  }

  send(to: string, subject: string, body: string) {
    const email = { to, subject, body, sentAt: new Date().toISOString() };
    this.emails.push(email);
    return email;
  }

  getEmails() {
    return this.emails;
  }
}
