import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { map, Observable, switchMap } from 'rxjs';
import { User } from 'src/auth/models/user.class';
import { UserService } from 'src/auth/services/user.service';
import { FeedPost } from '../models/post.interface';
import { FeedService } from '../services/feed.service';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private feedService: FeedService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: User; params: { id: number } } = request;

    if (!user || !params) return false;
    if (user.role === 'admin') return true;

    // console.log("feed-guards-isCreator user",user,"params",params);

    const userId = user.id;
    const postId = params.id;

    return this.userService.findUserById(userId).pipe(
      switchMap((user: User) =>
        this.feedService.findPostById(postId).pipe(
          map((feedPost: FeedPost) => {
            // console.log("feed-guards-isCreato-findUserById user", user);
            // console.log("feed-guards-isCreato-findUserById feedPost", feedPost);
            return userId === feedPost.author.id;
          }),
        ),
      ),
    );
  }
}
