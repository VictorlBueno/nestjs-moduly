import { Module } from '@nestjs/common';
import { Database, Cache } from './instances';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    Database.Primary,
    Database.Replica,
    Cache.Redis,
    ProductModule,
    OrderModule,
  ],
})
export class AppModule {}
