import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth) throw new UnauthorizedException('No authorization header');
    const parts = String(auth).split(' ');
    let token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];
    if (!token) throw new UnauthorizedException('No token');
    const userId = this.authService.validateAccessToken(token);
    if (!userId) throw new UnauthorizedException('Invalid token');
    // attach minimal user object to request
    req.user = { id: userId };
    return true;
  }
}
