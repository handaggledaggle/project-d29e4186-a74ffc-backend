import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artwork } from './artwork.entity';
import { ArtworksService } from './artworks.service';
import { ArtworksController } from './artworks.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork]), AuthModule],
  providers: [ArtworksService],
  controllers: [ArtworksController],
})
export class ArtworksModule {}
