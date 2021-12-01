import { Module } from '@nestjs/common';
import { FeedController } from './controllers/feed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeedPostEntity } from './models/post.entity';
import { FeedService } from './services/feed.service';
import { AuthModule } from 'src/auth/auth.module';
import { IsCreatorGuard } from './guards/is-creator.guard';

@Module({
  imports: [TypeOrmModule.forFeature([FeedPostEntity]), AuthModule],
  providers: [FeedService, IsCreatorGuard],
  controllers: [FeedController],
})
export class FeedModule {}
