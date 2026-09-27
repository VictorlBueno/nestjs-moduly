import { Module } from '@nestjs/common';
import { Repository } from '../../instances';
import { UserController } from './user.controller';

@Module({
  imports: [Repository.Users],
  controllers: [UserController],
})
export class UserModule {}
