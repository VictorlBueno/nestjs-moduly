import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Repository } from './instances';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    Repository.Users,
  ],
})
export class AppModule {}
