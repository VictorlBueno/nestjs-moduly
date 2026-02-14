import { Module } from '@nestjs/common';
import { Database, Cache } from './instances';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ProductModule,
    OrderModule,
  ],
  providers: [
    Database.Primary,
    Database.Replica,
    Cache.Redis,
  ],
})
export class AppModule {}
