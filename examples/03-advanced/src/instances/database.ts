import { createInstanceGroup } from 'nestjs-moduly';
import { DatabaseService } from '../services/database.service';

export const Database = createInstanceGroup('Database', {
  useClassAsToken: false,
});

Database.Primary = () => new DatabaseService('PrimaryDB');
Database.Replica = () => new DatabaseService('ReplicaDB');
