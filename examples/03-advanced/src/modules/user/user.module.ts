import { Module } from '@nestjs/common';
import { Repository, Infrastructure, Cache, Notification } from '../../instances';
import { UserController } from './user.controller';

@Module({
  imports: [
    Repository.Users,
    Infrastructure.Logger,
    Cache.Redis,
    Notification.Main,
  ],
  controllers: [UserController],
})
export class UserModule {}
