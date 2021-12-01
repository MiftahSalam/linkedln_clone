import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model';
import { environment } from 'src/environments/environment';
import { FriendRequestStatus, FriendRequest_Status } from '../../models/FriendRequest';
import { BannerColorService } from '../../services/banner-color.service';
import { ConnectionProfileService } from '../../services/connection-profile.service';

@Component({
  selector: 'app-connection-profile',
  templateUrl: './connection-profile.component.html',
  styleUrls: ['./connection-profile.component.scss'],
})
export class ConnectionProfileComponent implements OnInit, OnDestroy {
  user: User;
  friendRequestStatus: FriendRequest_Status;
  friendRequestStatusSubscription$: Subscription;
  userSubscription$: Subscription;

  constructor(
    public bannerColorsService: BannerColorService,
    private route: ActivatedRoute,
    private connectionProfileService: ConnectionProfileService
  ) { }

  ngOnInit() {
    this.friendRequestStatusSubscription$ = this.getFriendRequestStatus().pipe(
      tap((friendRequestStatus: FriendRequestStatus) => {
        this.friendRequestStatus = friendRequestStatus.status;
        this.userSubscription$ = this.getUser().subscribe((user: User) => {
          this.user = user;
          console.log("connection-profile-ngOnInit-tap friendRequestStatus", this.friendRequestStatus);
          
          const imgPath = user.imagePath ?? 'blank-profile-picture.png';
          user['fullImagePath'] = `${environment.baseApiUrl}/feed/image/${imgPath}`;
        })
      })
    ).subscribe();
  }

  getUser(): Observable<User> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.connectionProfileService.getConnectionUser(userId);
      })
    )
  }

  addUser(): Subscription {
    this.friendRequestStatus = 'pending';
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.connectionProfileService.addConnectionUser(userId);
      })
    ).pipe(take(1)).subscribe();
  }

  getFriendRequestStatus(): Observable<FriendRequestStatus> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.connectionProfileService.getFriendRequestStatus(userId);
      })
    )
  }

  private getUserIdFromUrl(): Observable<number> {
    return this.route.url.pipe(
      map((urlSegments: UrlSegment[]) => {
        return +urlSegments[0].path
      })
    )
  }

  ngOnDestroy() {
    this.friendRequestStatusSubscription$.unsubscribe();
    this.userSubscription$.unsubscribe();
  }

}
