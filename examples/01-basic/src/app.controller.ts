import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserRepository } from "./repositories/user.repository";

@Controller()
export class AppController {
  constructor(private readonly userRepository: UserRepository) {}

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
