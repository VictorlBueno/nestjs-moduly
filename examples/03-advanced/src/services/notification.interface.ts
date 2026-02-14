export interface INotificationService {
  sendEmail(userId: string, subject: string, body: string): any;
  sendSMS(userId: string, message: string): any;
  sendNotification(userId: string, message: string, type: 'email' | 'sms' | 'both'): any;
  getNotifications(): any[];
}
