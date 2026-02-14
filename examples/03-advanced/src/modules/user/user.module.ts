import { Module } from '@nestjs/common';
import { Repository, Infrastructure, Cache, Notification } from '../../instances';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    Repository.Users,
    Infrastructure.Logger,
    Cache.Redis,
    Notification.Main,
  ],
  exports: [Repository.Users],
})
export class UserModule {}
