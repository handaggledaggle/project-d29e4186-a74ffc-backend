import { Body, Controller, Get, Param, Post, Query, UseGuards, Req, Patch, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/v1/artworks')
export class ArtworksController {
  constructor(private service: ArtworksService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.findList(query);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const art = await this.service.findOne(id);
    if (!art) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    // format response
    return {
      artwork_id: art.id,
      title: art.title,
      description: art.description,
      tags: art.tags ? art.tags.split(',') : [],
      category: art.category,
      price: Number(art.price),
      files: art.files,
      seller: { id: art.owner.id, display_name: art.owner.displayName },
      status: art.status,
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    // require SELLER role
    const user = req.user;
    // owner will be fetched by calling DB; for simplicity, owner object with id only
    const owner = { id: user.id } as any;
    try {
      const art = await this.service.create(owner, body);
      return { artwork_id: art.id, title: art.title, created_at: art.createdAt, files: art.files };
    } catch (err: any) {
      if (err.message === 'VALIDATION') throw new HttpException('Validation failed', HttpStatus.BAD_REQUEST);
      throw new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async patch(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      const updated = await this.service.update(id, req.user.id, body);
      return { artwork_id: updated.id, updated_at: updated.createdAt };
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      throw new HttpException('Internal', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      const art = await this.service.remove(id, req.user.id);
      return { artwork_id: art.id, status: art.status };
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      throw new HttpException('Internal', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
