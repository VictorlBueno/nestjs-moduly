import { Module } from '@nestjs/common';
import { Repository } from '../instances';
import { RequestTrackingController } from './request-tracking.controller';

@Module({
  controllers: [RequestTrackingController],
  providers: [
    Repository.RequestTracking,
  ],
  exports: [Repository.RequestTracking],
})
export class RequestTrackingModule {}
