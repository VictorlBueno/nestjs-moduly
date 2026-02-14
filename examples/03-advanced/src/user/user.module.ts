import { Module } from '@nestjs/common';
import { Repository } from '../instances';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    Repository.Users,
  ],
  exports: [Repository.Users],
})
export class UserModule {}
