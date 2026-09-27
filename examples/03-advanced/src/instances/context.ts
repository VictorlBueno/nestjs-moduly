import { createInstanceGroup } from 'nestjs-moduly';
import { RequestContextService } from '../services/request-context.service';
import { TransientCounterService } from '../services/transient-counter.service';

export const Context = createInstanceGroup('Context', {
  useClassAsToken: true,
});

Context.Request = () => new RequestContextService();
Context.Counter = () => new TransientCounterService();
