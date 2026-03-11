import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    // Accept both lowercase and proper-cased header keys and allow both
    // 'Authorization: Bearer <token>' and 'authorization: Bearer <token>' from various clients.
    // Also support a plain token header 'x-access-token' for older clients or proxies.
    const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    const altHeader = (req.headers['x-access-token'] || req.headers['X-Access-Token']) as string | undefined;

    const header = authHeader || altHeader;
    // Provide a clearer Unauthorized message so frontend can surface it.
    if (!header) throw new UnauthorizedException('Authorization header missing. Provide "Authorization: Bearer <token>" or "x-access-token: <token>"');

    // Support possible variations: "Bearer <token>" or just the token string
    const parts = String(header).split(' ');
    let token: string | undefined;
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    } else if (parts.length === 1) {
      // header contains token only
      token = parts[0];
    } else {
      throw new UnauthorizedException('Malformed Authorization header');
    }

    const userId = this.authService.validateAccessToken(token);
    if (!userId) throw new UnauthorizedException('Invalid or expired token');
    // attach userId to request for controllers/services
    (req as any).user = { id: userId };
    return true;
  }
}
