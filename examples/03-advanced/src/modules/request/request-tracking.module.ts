import { Module } from '@nestjs/common';
import { Repository, RequestScope, TransientScope, Analytics } from '../../instances';
import { RequestTrackingController } from './request-tracking.controller';

@Module({
  controllers: [RequestTrackingController],
  providers: [
    Repository.RequestTracking,
    RequestScope.Context,
    TransientScope.Counter,
    Analytics.Tracker,
  ],
  exports: [Repository.RequestTracking],
})
export class RequestTrackingModule {}
