import { createInstanceGroup } from 'nestjs-moduly';
import { LoggerService } from '../services/logger.service';

export const Infrastructure = createInstanceGroup('Infrastructure', {
  global: true,
  useClassAsToken: true,
});

Infrastructure.Logger = () => new LoggerService();
