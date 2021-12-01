import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { take, tap } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model';
import { FriendRequest } from 'src/app/home/models/FriendRequest';
import { ConnectionProfileService } from 'src/app/home/services/connection-profile.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-friend-requwst-popover',
  templateUrl: './friend-requwst-popover.component.html',
  styleUrls: ['./friend-requwst-popover.component.scss'],
})
export class FriendRequwstPopoverComponent implements OnInit {

  constructor(
    public connectionProfileService: ConnectionProfileService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.connectionProfileService.friendRequests.map(
      (friendRequest: FriendRequest) => {
        const creatorId = (friendRequest as any)?.creator?.id;

        if(friendRequest && creatorId) {
          this.connectionProfileService.getConnectionUser(creatorId).pipe(
            take(1),
            tap((user: User) => {
              friendRequest['fullImagePath'] = `${environment.baseApiUrl}/feed/image/${user?.imagePath || 'blank-profile-picture.png'}`
            })
          ).subscribe()
        }
      }
    )
  }

  async responseToFriendRequest(id: number, statusResponse: 'accepted' | 'declined') {
    const handleFriendRequest: FriendRequest = this.connectionProfileService.friendRequests.find((friendRequest) => friendRequest.id === id);
    const unhandleFriendRequests: FriendRequest[] = this.connectionProfileService.friendRequests.filter((friendRequest) => friendRequest.id !== handleFriendRequest.id);

    this.connectionProfileService.friendRequests = unhandleFriendRequests;

    if(this.connectionProfileService?.friendRequests.length === 0) await this.popoverController.dismiss();
    return this.connectionProfileService.responseToFriendRequest(id, statusResponse).pipe(
      take(1)
    ).subscribe();
  }

}
