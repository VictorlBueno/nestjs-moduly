import { createInstanceGroup } from 'nestjs-moduly';
import { EmailService } from '../services/email.service';
import { SMSService } from '../services/sms.service';
import { NotificationService } from '../services/notification.service';

export const NotificationEmail = createInstanceGroup('NotificationEmail');
export const NotificationSMS = createInstanceGroup('NotificationSMS');
export const Notification = createInstanceGroup('Notification');

Notification.Main = () =>
  new NotificationService(NotificationEmail.Email, NotificationSMS.SMS);

NotificationEmail.Email = () =>
  new EmailService({ from: 'noreply@example.com', smtp: 'smtp.example.com' });

NotificationSMS.SMS = () => new SMSService({ provider: 'twilio', apiKey: 'xxx' });
