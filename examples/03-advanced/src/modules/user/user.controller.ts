import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';

@Controller('users')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

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

  @Post()
  create(@Body() body: { name: string; email: string }) {
    return this.userRepository.create(body);
  }
}
