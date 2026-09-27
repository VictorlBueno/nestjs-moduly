import { Module } from '@nestjs/common';
import { getAllInstances } from './instances';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { RequestTrackingModule } from './modules/request/request-tracking.module';

@Module({
  imports: [UserModule, ProductModule, RequestTrackingModule],
})
export class AppModule {
  constructor() {
    const all = getAllInstances();
    console.log(`\n[moduly] Resolved instances: ${all.size}`);
    all.forEach((instance: any, token) => {
      console.log(`  - ${token}: ${instance?.constructor?.name}`);
    });
  }
}
