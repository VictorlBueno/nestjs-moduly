import { Module } from '@nestjs/common';
import { Repository } from '../../instances';
import { RequestTrackingController } from './request-tracking.controller';

@Module({
  imports: [Repository.RequestTracking],
  controllers: [RequestTrackingController],
})
export class RequestTrackingModule {}
