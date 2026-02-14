export interface IEmailService {
  send(to: string, subject: string, body: string): any;
  getEmails(): Array<{ to: string; subject: string; body: string; sentAt: string }>;
}
