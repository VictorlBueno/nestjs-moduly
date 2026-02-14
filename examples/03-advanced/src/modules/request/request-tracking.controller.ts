import { Controller, Get } from '@nestjs/common';
import { RequestTrackingRepository } from '../../repositories/request-tracking.repository';

@Controller('tracking')
export class RequestTrackingController {
  constructor(private readonly requestTrackingRepository: RequestTrackingRepository) {}

  @Get('request-id')
  getRequestId() {
    return this.requestTrackingRepository.getRequestId();
  }

  @Get('increment')
  increment() {
    return this.requestTrackingRepository.incrementAndGet();
  }

  @Get('count')
  getCount() {
    return this.requestTrackingRepository.getCount();
  }
}
