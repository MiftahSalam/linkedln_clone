import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FriendRequest } from '../../models/FriendRequest';
import { ConnectionProfileService } from '../../services/connection-profile.service';
import { FriendRequwstPopoverComponent } from './friend-requwst-popover/friend-requwst-popover.component';

import { PopoverComponent } from './popover/popover.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userFullImagePath: string;
  private userImagepathSubsription: Subscription;
  friendRequestSubscription: Subscription;

  constructor(
    public popoverController: PopoverController, 
    private authService: AuthService,
    public connectionProfileService: ConnectionProfileService
    ) { }

  ngOnInit() {
    this.authService.getUserImageName().pipe(
      take(1),
      tap(({ imageName }) => {
        const defaultImagePath = 'blank-profile-picture.png';
        this.authService.updateUserImagePath(imageName || defaultImagePath).subscribe();
      })
      ).subscribe()

    this.userImagepathSubsription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    });

    this.friendRequestSubscription = this.connectionProfileService.getFriendRequests().subscribe(
      (friendRequests: FriendRequest[]) => {        
        this.connectionProfileService.friendRequests = friendRequests.filter((friendRequest: FriendRequest) => friendRequest.status === 'pending');
      }
    )
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      cssClass: "my-custom-class",
      event: ev,
      showBackdrop: false
    });

    await popover.present();

    const { role } = await popover.onDidDismiss();

    console.log("onDismiss resolved with role", role);
    
  }

  ngOnDestroy() {
    this.userImagepathSubsription.unsubscribe();
    this.friendRequestSubscription.unsubscribe();
  }

  async presentFriendRequestPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: FriendRequwstPopoverComponent,
      cssClass: "my-custom-class",
      event: ev,
      showBackdrop: false
    });

    await popover.present();

    const { role } = await popover.onDidDismiss();

    console.log("onDismiss resolved with role", role);
    
  }
}
