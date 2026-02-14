import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Repository } from './instances';

@Module({
  imports: [Repository.Users],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
