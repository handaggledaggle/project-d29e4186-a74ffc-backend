import { Body, Controller, Post, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';

@Controller('api/v1/reports')
export class ReportsController {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (!body.target_type || !body.target_id || !body.reason_code) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }
    const r = this.repo.create({ reporterId: req.user.id, targetType: body.target_type, targetId: body.target_id, reasonCode: body.reason_code, description: body.description });
    const saved = await this.repo.save(r);
    return { report_id: saved.id, status: saved.status, created_at: saved.createdAt };
  }
}
