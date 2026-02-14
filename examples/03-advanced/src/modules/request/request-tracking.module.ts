import { Module } from '@nestjs/common';
import { Repository, RequestScope, TransientScope, Analytics } from '../../instances';
import { RequestTrackingController } from './request-tracking.controller';

@Module({
  imports: [
    Repository.RequestTracking,
    RequestScope.Context,
    TransientScope.Counter,
    Analytics.Tracker,
  ],
  controllers: [RequestTrackingController],
})
export class RequestTrackingModule {}
