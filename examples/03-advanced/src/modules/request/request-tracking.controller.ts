import { Controller, Get } from '@nestjs/common';
import { IRequestTrackingRepository } from '../../repositories/request-tracking.interface';

@Controller('tracking')
export class RequestTrackingController {
  constructor(private readonly requestTrackingRepository: IRequestTrackingRepository) {}

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
