import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers['authorization'];
    if (!header) throw new UnauthorizedException('No auth header');
    const parts = String(header).split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedException('Malformed auth header');
    const token = parts[1];
    const userId = this.authService.validateAccessToken(token);
    if (!userId) throw new UnauthorizedException('Invalid token');
    // attach userId to request for controllers/services
    (req as any).user = { id: userId };
    return true;
  }
}
