import { createInstanceGroup } from 'nestjs-moduly';
import { AnalyticsService } from '../services/analytics.service';

export const Analytics = createInstanceGroup('Analytics', {
  useClassAsToken: true,
});

Analytics.Tracker = () =>
  new AnalyticsService({
    apiKey: 'analytics-key',
    endpoint: 'https://analytics.example.com',
  });
