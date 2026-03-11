import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artwork } from './artwork.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ArtworksService {
  constructor(@InjectRepository(Artwork) private repo: Repository<Artwork>) {}

  async create(owner: User, payload: Partial<Artwork>) {
    if (!payload.title || payload.price == null) {
      throw new Error('VALIDATION');
    }
    const art = this.repo.create({
      title: payload.title,
      description: payload.description,
      tags: Array.isArray(payload.tags) ? payload.tags.join(',') : payload.tags,
      category: payload.category,
      price: payload.price,
      files: payload.files,
      owner,
      status: payload.status || 'PUBLIC',
    });
    return this.repo.save(art);
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['owner'] });
  }

  async findList(query: { category?: string; q?: string; page?: number; page_size?: number; sort?: string }) {
    const qb = this.repo.createQueryBuilder('a').leftJoinAndSelect('a.owner', 'owner').where('a.status = :status', { status: 'PUBLIC' });
    if (query.category) qb.andWhere('a.category = :category', { category: query.category });
    if (query.q) qb.andWhere('(a.title ILIKE :q OR a.description ILIKE :q)', { q: `%${query.q}%` });
    const page = query.page || 1;
    const page_size = query.page_size || 20;
    if (query.sort === 'price_asc') qb.orderBy('a.price', 'ASC');
    else qb.orderBy('a.createdAt', 'DESC');
    const [items, total] = await qb.skip((page - 1) * page_size).take(page_size).getManyAndCount();
    return { items, total_count: total, page, page_size };
  }

  async update(id: string, ownerId: string, update: Partial<Artwork>) {
    const art = await this.findOne(id);
    if (!art) throw new NotFoundException();
    if (art.owner.id !== ownerId) throw new Error('FORBIDDEN');
    Object.assign(art, update);
    return this.repo.save(art);
  }

  async remove(id: string, ownerId: string) {
    const art = await this.findOne(id);
    if (!art) throw new NotFoundException();
    if (art.owner.id !== ownerId) throw new Error('FORBIDDEN');
    // For MVP, toggle status to HIDDEN instead of hard delete
    art.status = 'HIDDEN';
    return this.repo.save(art);
  }
}
