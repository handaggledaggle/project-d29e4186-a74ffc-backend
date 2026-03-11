import { Body, Controller, Get, Param, Post, Query, UseGuards, Req, Patch, Delete, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/v1/artworks')
export class ArtworksController {
  private readonly logger = new Logger(ArtworksController.name);
  constructor(private service: ArtworksService) {}

  @Get()
  async list(@Query() query: any) {
    // Return a simplified list format suitable for feed pages
    const result = await this.service.findList(query);
    // map items to API shape consumed by frontend
    const items = result.items.map((art) => ({
      artwork_id: art.id,
      title: art.title,
      description: art.description,
      tags: art.tags ? art.tags.split(',') : [],
      category: art.category,
      price: Number(art.price),
      files: art.files,
      seller: art.owner ? { id: art.owner.id, display_name: art.owner.displayName } : null,
      status: art.status,
      created_at: art.createdAt,
    }));
    return { items, total_count: result.total_count, page: result.page, page_size: result.page_size };
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
    // require SELLER role - currently AuthGuard only validates user id, role enforcement may be added later
    const user = req.user;
    // owner will be fetched by calling DB; for simplicity, owner object with id only
    const owner = { id: user.id } as any;
    try {
      const art = await this.service.create(owner, body);
      return { artwork_id: art.id, title: art.title, created_at: art.createdAt, files: art.files };
    } catch (err: any) {
      // Handle both Error instances and other thrown values
      const message = err && err.message ? err.message : String(err);
      // Provide more specific messages for common failures so frontend can show helpful text
      if (message === 'VALIDATION') {
        this.logger.warn(`Artwork create validation failed for user=${user?.id}, payload=${JSON.stringify(body)}`);
        throw new HttpException('Validation failed: title and price are required', HttpStatus.BAD_REQUEST);
      }
      this.logger.error('Artwork create failed', err?.stack || err);
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
      const message = err && err.message ? err.message : String(err);
      if (message === 'FORBIDDEN') {
        this.logger.warn(`Forbidden update attempt user=${req.user?.id} artwork=${id}`);
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      if (err instanceof Error && err.name === 'NotFoundException') {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }
      this.logger.error('Artwork update failed', err?.stack || err);
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
      const message = err && err.message ? err.message : String(err);
      if (message === 'FORBIDDEN') {
        this.logger.warn(`Forbidden delete attempt user=${req.user?.id} artwork=${id}`);
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      if (err instanceof Error && err.name === 'NotFoundException') {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }
      this.logger.error('Artwork remove failed', err?.stack || err);
      throw new HttpException('Internal', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
