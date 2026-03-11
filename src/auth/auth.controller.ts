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
      // support both display_name and displayName from client
      const displayName = (body as any).displayName || (body as any).display_name;
      const user = await this.authService.register(body.email, body.password, displayName);
      return { user_id: user.id, email: user.email, created_at: user.createdAt };
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      if (err.message === 'INVALID_INPUT') throw new HttpException('Invalid input', HttpStatus.BAD_REQUEST);
      throw new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const tokens = await this.authService.login(body.email, body.password);
    if (!tokens) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    return tokens;
  }
}
