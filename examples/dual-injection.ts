import { Module, Injectable, Inject } from '@nestjs/common';
import { createInstanceGroup } from 'nestjs-moduly';

@Injectable()
class DatabaseService {
  constructor(private config: any) {
    console.log(`DatabaseService created for ${config.host}`);
  }

  query(sql: string) {
    return { sql, result: 'query executed' };
  }
}

export const Database = createInstanceGroup('Database');

Database.Primary = new DatabaseService({ host: 'primary-db', port: 5432 });
Database.Replica = new DatabaseService({ host: 'replica-db', port: 5432 });

@Module({
  imports: [
    Database.Primary,
    Database.Replica,
  ],
})
export class DualInjectionModule {
  constructor(
    @Inject('Database.Primary') private primaryDb: DatabaseService,
    @Inject('Database.Replica') private replicaDb: DatabaseService,
  ) {
    console.log('DualInjectionModule initialized');
  }

  async getData(query: string) {
    const primaryResult = this.primaryDb.query(query);
    const replicaResult = this.replicaDb.query(query);
    return { primary: primaryResult, replica: replicaResult };
  }
}
