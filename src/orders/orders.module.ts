import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuthModule } from '../auth/auth.module';
import { ArtworksModule } from '../artworks/artworks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), AuthModule, ArtworksModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
