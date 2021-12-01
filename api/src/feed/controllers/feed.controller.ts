import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { IsCreatorGuard } from '../guards/is-creator.guard';
import { UserService } from 'src/auth/services/user.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService, private readonly userService: UserService) {}

  //   @Roles(Role.ADMIN, Role.PREMIUM)
  //   @UseGuards(JwtGuard, RolesGuard)
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() feedPost: FeedPost, @Request() req): Observable<FeedPost> {
    return this.feedService.createPost(req.user, feedPost);
  }

  // @Get()
  // findAll(): Observable<FeedPost[]> {
  //     return this.feedService.findAllPost();
  // }

  @UseGuards(JwtGuard)
  @Get()
  findSelected(
    @Query('take') take = 1,
    @Query('skip') skip = 1,
  ): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take;
    return this.feedService.findPosts(take, skip);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() post: FeedPost,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, post);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }

  @Get('image/:filename')
  findImageByName(@Param('filename') filename: string, @Res() res) {
    if(!filename || ['null', '[null]'].includes(filename)) return;
    return res.sendFile(filename, { root: './images'});
  }
}
