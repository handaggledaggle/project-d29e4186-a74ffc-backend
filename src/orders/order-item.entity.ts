import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (o) => o.items)
  order: Order;

  @Column()
  artworkId: string;

  @Column('int')
  quantity: number;

  @Column('numeric')
  unitPrice: number;
}
