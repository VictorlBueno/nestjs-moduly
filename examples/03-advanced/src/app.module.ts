import { Module } from '@nestjs/common';
import { Infrastructure, Database, Cache, RequestScope, TransientScope, instanceGroupToArray, allInstanceGroupsToArray, getAllInstances } from './instances';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { RequestTrackingModule } from './request/request-tracking.module';

@Module({
  imports: [
    UserModule,
    ProductModule,
    RequestTrackingModule,
  ],
  providers: [
    Infrastructure.Logger,
    Database.Primary,
    Database.Replica,
    Cache.Redis,
    Cache.Memcached,
    RequestScope.Context,
    TransientScope.Counter,
  ],
})
export class AppModule {
  constructor() {
    console.log('=== All Registered Instances ===');
    const allInstancesMap = getAllInstances();
    console.log(`Total instances in map: ${allInstancesMap.size}`);
    allInstancesMap.forEach((instance: any, token) => {
      console.log(`  - ${token}: ${instance.constructor.name}`);
    });

    console.log('\n=== All Instance Groups as Array ===');
    const allInstances = allInstanceGroupsToArray();
    console.log(`Total providers: ${allInstances.length}`);

    console.log('\n=== Infrastructure Group ===');
    const infraGroup = instanceGroupToArray('Infrastructure');
    console.log(`Infrastructure providers: ${infraGroup.length}`);

    console.log('\n=== Database Group ===');
    const dbGroup = instanceGroupToArray('Database');
    console.log(`Database providers: ${dbGroup.length}`);

    console.log('\n=== Cache Group ===');
    const cacheGroup = instanceGroupToArray('Cache');
    console.log(`Cache providers: ${cacheGroup.length}`);

    console.log('\n=== Request Scope Group ===');
    const requestGroup = instanceGroupToArray('RequestScope');
    console.log(`RequestScope providers: ${requestGroup.length}`);

    console.log('\n=== Transient Scope Group ===');
    const transientGroup = instanceGroupToArray('TransientScope');
    console.log(`TransientScope providers: ${transientGroup.length}`);
  }
}
