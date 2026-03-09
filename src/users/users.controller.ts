import { Body, Controller, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Endpoint to request SELLER role
  @UseGuards(AuthGuard)
  @Post(':userId/roles')
  async addRole(@Param('userId') userId: string, @Body() body: { role: string }) {
    const updated = await this.usersService.addRole(userId, body.role);
    if (!updated) throw new NotFoundException();
    return { user_id: updated.id, roles: updated.roles.split(','), updated_at: updated.createdAt };
  }
}
