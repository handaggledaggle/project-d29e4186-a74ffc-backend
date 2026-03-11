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
    // Normalize header lookup to avoid issues where frameworks/libraries lowercase header keys
    const authorizationHeader = req.headers['authorization'] as string | undefined;
    const xAccessTokenHeader = req.headers['x-access-token'] as string | undefined;

    // Prefer Authorization header, fallback to x-access-token
    const header = authorizationHeader || xAccessTokenHeader;

    // Provide a clearer Unauthorized message so frontend can surface it.
    if (!header) {
      // Throw UnauthorizedException with descriptive message so frontend can show friendly text
      throw new UnauthorizedException('Authorization header missing. Provide "Authorization: Bearer <token>" or "x-access-token: <token>"');
    }

    // Support possible variations: "Bearer <token>" or just the token string
    const parts = String(header).trim().split(' ');
    let token: string | undefined;
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      token = parts[1];
    } else if (parts.length === 1) {
      // header contains token only
      token = parts[0];
    } else {
      throw new UnauthorizedException('Malformed Authorization header');
    }

    if (!token) throw new UnauthorizedException('Authorization token missing');

    const userId = this.authService.validateAccessToken(token);
    if (!userId) throw new UnauthorizedException('Invalid or expired token');
    // attach userId to request for controllers/services
    (req as any).user = { id: userId };
    return true;
  }
}
