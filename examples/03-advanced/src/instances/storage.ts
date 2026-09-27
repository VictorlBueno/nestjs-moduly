import { createInstanceGroup } from 'nestjs-moduly';
import { S3Service } from '../services/s3.service';

export const Storage = createInstanceGroup('Storage', {
  useClassAsToken: true,
});

Storage.S3 = () => new S3Service({ bucket: 'my-bucket', region: 'us-east-1' });
