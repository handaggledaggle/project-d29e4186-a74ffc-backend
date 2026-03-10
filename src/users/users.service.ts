import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(payload: Partial<User>) {
    const user = this.repo.create({
      email: payload.email,
      password: payload.password,
      // Accept either displayName or display_name from payload and normalize to displayName
      displayName: (payload as any).displayName ?? (payload as any).display_name ?? null,
      roles: payload.roles || 'USER',
    } as Partial<User>);
    return this.repo.save(user);
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async addRole(userId: string, role: string) {
    const user = await this.findById(userId);
    if (!user) return null;
    const roles = new Set((user.roles || 'USER').split(',').map((r) => r.trim()));
    roles.add(role);
    user.roles = Array.from(roles).join(',');
    return this.repo.save(user);
  }
}
