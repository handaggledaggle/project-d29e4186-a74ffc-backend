import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../auth/auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Artwork } from '../artworks/artwork.entity';
import { Repository } from 'typeorm';

@Controller('api/v1/orders')
export class OrdersController {
  constructor(private ordersService: OrdersService, @InjectRepository(Artwork) private artworkRepo: Repository<Artwork>) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    // body.items = [{ artwork_id, quantity }]
    const order = await this.ordersService.create(req.user, body.items, this.artworkRepo);
    return { order_id: order.id, total_amount: Number(order.totalAmount), status: order.status };
  }

  @UseGuards(AuthGuard)
  @Get()
  async list(@Req() req: any) {
    const orders = await this.ordersService.findByUser(req.user.id);
    return { orders };
  }
}
