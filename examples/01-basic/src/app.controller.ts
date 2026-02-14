import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IUserRepository } from "./repositories/user.interface";

@Controller()
export class AppController {
  constructor(private readonly userRepository: IUserRepository) {}

  @Get('users')
  getAllUsers() {
    return this.userRepository.findAll();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.userRepository.findById(id);
  }

  @Post('users')
  createUser(@Body() body: { name: string; email: string }) {
    return this.userRepository.create(body);
  }
}
