import { Controller, Get, Delete } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userRepository: IUserRepository) {}

  @Get()
  findAll() {
    return this.userRepository.findAll();
  }

  @Get('logs')
  getLogs() {
    return this.userRepository.getUserLogs();
  }

  @Delete('logs')
  clearLogs() {
    return this.userRepository.clearLogs();
  }
}
