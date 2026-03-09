import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Artwork } from '../artworks/artwork.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
  ) {}

  async create(buyer: any, items: { artwork_id: string; quantity: number }[], artworkRepo: Repository<Artwork>) {
    if (!items || items.length === 0) throw new BadRequestException('No items');
    let total = 0;
    const orderItems: OrderItem[] = [];
    for (const it of items) {
      const art = await artworkRepo.findOne({ where: { id: it.artwork_id } });
      if (!art) throw new NotFoundException('Artwork not found');
      if (art.status !== 'PUBLIC') throw new BadRequestException('Artwork not available');
      const unit = Number(art.price);
      total += unit * (it.quantity || 1);
      const oi = this.itemRepo.create({ artworkId: art.id, quantity: it.quantity || 1, unitPrice: unit });
      orderItems.push(oi);
    }
    const order = this.repo.create({ buyer: { id: buyer.id } as any, totalAmount: total, status: 'PENDING_PAYMENT', items: orderItems });
    return this.repo.save(order);
  }

  async findByUser(buyerId: string) {
    return this.repo.find({ where: { buyer: { id: buyerId } }, relations: ['items'] as any });
  }
}
