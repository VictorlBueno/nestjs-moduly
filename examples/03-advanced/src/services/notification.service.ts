export class NotificationService {
  private notifications: Array<{ userId: string; message: string; type: string; createdAt: string }> = [];

  constructor(
    private email: any,
    private sms: any,
  ) {}

  sendEmail(userId: string, subject: string, body: string) {
    return this.email.send(`user${userId}@example.com`, subject, body);
  }

  sendSMS(userId: string, message: string) {
    return this.sms.send(`+1234567890${userId}`, message);
  }

  sendNotification(userId: string, message: string, type: 'email' | 'sms' | 'both') {
    const notification = { userId, message, type, createdAt: new Date().toISOString() };
    this.notifications.push(notification);

    if (type === 'email' || type === 'both') {
      this.sendEmail(userId, `Notification`, message);
    }
    if (type === 'sms' || type === 'both') {
      this.sendSMS(userId, message);
    }

    return notification;
  }

  getNotifications() {
    return this.notifications;
  }
}
