import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { randomUUID, createHash } from 'crypto';

@Injectable()
export class AuthService {
  // Simple in-memory token store for demo purposes.
  private tokenToUserId = new Map<string, string>();
  constructor(private usersService: UsersService) {}

  // Very small password hash using sha256 (replace with bcrypt in prod)
  hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
  }

  async register(email: string, password: string, displayName?: string) {
    // Basic validation guard (service-level)
    if (!email || typeof email !== 'string') throw new Error('INVALID_EMAIL');
    if (!password || typeof password !== 'string' || password.length < 6) throw new Error('INVALID_PASSWORD');

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }
    const hashed = this.hashPassword(password);
    // Ensure we pass displayName in expected field name
    const user = await this.usersService.create({ email, password: hashed, displayName });
    return user;
  }

  async login(email: string, password: string) {
    if (!email || !password) return null;
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const hashed = this.hashPassword(password);
    if (user.password !== hashed) return null;

    const accessToken = randomUUID();
    const refreshToken = randomUUID();
    // store access token mapping
    this.tokenToUserId.set(accessToken, user.id);
    // expose token -> user mapping for guard to use (AuthGuard will call validateAccessToken)
    return { access_token: accessToken, refresh_token: refreshToken, expires_in: 3600 };
  }

  validateAccessToken(token: string) {
    const userId = this.tokenToUserId.get(token);
    return userId || null;
  }
}
