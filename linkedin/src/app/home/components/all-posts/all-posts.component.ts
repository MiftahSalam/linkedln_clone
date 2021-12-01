import { Component, Input, OnDestroy, OnInit, SimpleChange, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';

import { Post } from '../../models/Post';
import { PostService } from '../../services/post.service';
import { ModalComponent } from '../start-post/modal/modal.component';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @Input() postBody?: string;
  @Input() postId?: number;

  queryParams: string;
  allLoadedPosts: Post[] = [];
  numberOfPosts = 5;
  skipPosts = 0;
  userId$ = new BehaviorSubject<number>(null);
  private userSubscription: Subscription;

  constructor(
    private postService: PostService, 
    private authService: AuthService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.userSubscription = this.authService.userStream.subscribe((user: User) => {
      this.allLoadedPosts.forEach((post: Post, index: number) => {
        if(user?.imagePath && post.author.id === user.id) {
          this.allLoadedPosts[index]['fullImagePath'] = this.authService.getFullImagePath(user.imagePath);
        }
      })
    });
    this.getPosts(false, null);
    this.authService.userId.pipe(take(1)).subscribe((userId: number) => {
      this.userId$.next(userId);
    })
  }
  ngOnChanges(changes: SimpleChange) {
    if(!changes['postBody']) return;

    const postBody = changes['postBody'].currentValue;

    if(!postBody) return;
    this.postService.createPost(postBody).subscribe((post: Post) => {
      this.authService.userFullImagePath.pipe(take(1)).subscribe((fullImagePath: string) => {
        post['fullImagePath'] = fullImagePath;
        this.allLoadedPosts.unshift(post);
      })
    })
  }

  getPosts(initialLoad: boolean, event) {
    if(this.skipPosts === 20) event.target.disabled = true;
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;
    this.postService.getSelectedPosts(this.queryParams).subscribe((posts: Post[]) => {
      posts.forEach(post => {
        const isAuthorHasImagePath = !!post.author.imagePath;
        let fullImagePath = this.authService.getDefaultFullImagePath();
        
        if(isAuthorHasImagePath) {
          fullImagePath = this.authService.getFullImagePath(post.author.imagePath);
        }
        post['fullImagePath'] = fullImagePath;
        this.allLoadedPosts.push(post);
        // console.log("allPostComponent-getPosts-getSelectedPosts post", post);
      });
    
      if(initialLoad) event.target.complete();
      this.skipPosts += 5;
      }, (error) => {
        console.error("allPostComponent-getPosts-getSelectedPosts-error", error);
      }
    );
  }

  loadData(event) {
    this.getPosts(true, event)
  }

  async presentUpdateModal(postId: number) {
    // console.log("home-component-allposts-presentUpdateModal postId", postId);

    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2',
      componentProps: {
        postId
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if(!data) return; 

    const newPostBody = data.post.body;
    this.postService.updatePost(postId, newPostBody).subscribe(() => {
      const postIndex = this.allLoadedPosts.findIndex((post: Post) => post.id === postId);
      this.allLoadedPosts[postIndex].body = newPostBody;
    })
    
  }

  deletePost(postId: number) {
    this.postService.deletePost(postId).subscribe((data: any) => {
      // console.log("home-component-allposts-deletePost subscribe data", data);
      this.allLoadedPosts =  this.allLoadedPosts.filter((post: Post) => post.id !== postId);
    })
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}
