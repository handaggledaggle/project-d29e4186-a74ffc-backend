import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      // Support both display_name (from frontend) and displayName (internal)
      const displayName = (body as any).display_name ?? (body as any).displayName ?? (body as any).display_name;

      // Basic validation to provide clearer errors to frontend
      if (!body || !('email' in body) || typeof (body as any).email !== 'string') {
        throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
      }
      if (!body || !('password' in body) || typeof (body as any).password !== 'string' || (body as any).password.length < 6) {
        throw new HttpException('Password must be at least 6 characters', HttpStatus.BAD_REQUEST);
      }

      // Ensure we pass displayName in the property name expected by UsersService.create
      const user = await this.authService.register((body as any).email, (body as any).password, displayName);
      return { user_id: user.id, email: user.email, created_at: user.createdAt };
    } catch (err: any) {
      // Normalize known error shapes (string / Error)
      const msg = err?.message ?? err;
      if (msg === 'EMAIL_EXISTS' || msg === 'Email already exists') throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      if (err instanceof HttpException) throw err;
      // Log to console for easier debugging in production runtime (kept minimal)
      // eslint-disable-next-line no-console
      console.error('Register error:', err);
      throw new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    // Validate incoming body to avoid undefined values causing silent failures
    if (!body || typeof (body as any).email !== 'string' || typeof (body as any).password !== 'string') {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    const tokens = await this.authService.login((body as any).email, (body as any).password);
    if (!tokens) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    // Return tokens in a consistent, JSON-friendly shape expected by frontend
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    };
  }
}
