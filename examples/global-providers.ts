import { Module, Injectable, Inject } from '@nestjs/common';
import { createInstanceGroup } from 'nestjs-moduly';

class LoggerService {
  constructor() {
    console.log('LoggerService created');
  }

  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}

export const GlobalInfrastructure = createInstanceGroup('GlobalInfrastructure', {
  global: true,
});

GlobalInfrastructure.Logger = new LoggerService();

@Injectable()
export class AnyService {
  constructor(
    @Inject('GlobalInfrastructure.Logger') private logger: LoggerService,
  ) {
    this.logger.log('Service initialized');
  }
}

@Module({
  providers: [AnyService],
})
export class GlobalProvidersModule {}
