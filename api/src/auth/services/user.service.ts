import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { Repository, UpdateResult } from 'typeorm';
import { FriendRequestEntity } from '../models/friend-request.entity';
import { FriendRequest, FriendRequest_Status } from '../models/friend-request.interface';

import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.class';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>
  ) {}

  findImageNameByUserId(id: number): Observable<string> {
    return from(this.userRepository.findOne({ id })).pipe(
      map((user: User) => {
        delete user.password;
        return user.imagePath;
      }),
    );
  }
  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    const user: User = new UserEntity();
    user.id = id;
    user.imagePath = imagePath;

    // console.log("auth-services-userService-updateUserImageById User", user);

    return from(this.userRepository.update(id, user));
  }

  findUserById(id: number): Observable<User> {
    return from(
      this.userRepository.findOne({ id }, { relations: ['feedPosts'] }),
    ).pipe(
      map((user: User) => {
        if(!user) {
          throw new HttpException({ status: HttpStatus.NOT_FOUND, error: 'User not found' }, HttpStatus.NOT_FOUND);
        }
        delete user.password;
        return user;
      }),
    );
  }

  hasRequestBeenSentOrReceived(creator: User, receiver: User): Observable<boolean> {
    return from(this.friendRequestRepository.findOne({
      where: [
        { creator, receiver },
        { creator: receiver, receiver: creator },
      ],
    })).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if(!friendRequest) return of(false);
        return of(true);
      })
    )
  }

  sendFriendRequest(receiverId: number, creator: User): Observable<FriendRequest | { error: string }> {
    if(receiverId === creator.id) return of({ error: 'It is not possible to add yourself' });

    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
          switchMap((hasRequestBeenSentOrReceived: boolean) => {
            if(hasRequestBeenSentOrReceived) return of({ error: 'A friend request has been sent or received to your account' })

            const friendRequest: FriendRequest = {
              creator, receiver, status: 'pending'
            };
            return from(this.friendRequestRepository.save(friendRequest));
          })
        )
      })
    )
  }

  getFriendRequestStatus(receiverId: number, currentUser: User): Observable<FriendRequest_Status> {
    // console.log("auth-userService-getFriendRequestStatus receiverId",receiverId);

    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        return from(this.friendRequestRepository.findOne({
          where: [
            { creator: currentUser, receiver: receiver},
            { creator: receiver, receiver: currentUser}
          ],
          relations: ['creator', 'receiver']
        }));
      }),
      switchMap((friendRequest: FriendRequest) => {
        if(friendRequest?.receiver.id === currentUser.id) {
          return of('waiting-current-user-response' as FriendRequest_Status);
        }
        // console.log("auth-userService-getFriendRequestStatus friendRequest",friendRequest);
        
        return of(friendRequest?.status || 'not-sent')
      })
    )
  }

  getFriendRequestById(friendRequestId: number): Observable<FriendRequest> {
    return from(this.friendRequestRepository.findOne({ id: friendRequestId }));
  }

  responseToFriendRequest(
    statusResponse: FriendRequest_Status,
    friendRequestId: number  
  ): Observable<FriendRequest> {
    return this.getFriendRequestById(friendRequestId).pipe(
      switchMap((friendRequest: FriendRequest) => {
        return from(this.friendRequestRepository.save({
          ...friendRequest,
          status: statusResponse,
        }))
      })
    )
  }

  getFriendRequestFromRecipient(currentUser: User): Observable<{ status: FriendRequest_Status }[]> {
    return from(this.friendRequestRepository.find({ 
      where:[
        { receiver: currentUser },
      ],
      relations: ['receiver', 'creator']
     }));
  }

  getFriends(currentUser: User): Observable<User[]> {
    return from(this.friendRequestRepository.find({
      where: [
        { creator: currentUser, status: "accepted"},
        { receiver: currentUser, status: "accepted"}
      ],
      relations: ['creator', "receiver"]
    })).pipe(
      switchMap((friends: FriendRequest[]) => {
        let userIds: number[] = [];

        friends.forEach((friend: FriendRequest) => {
          if(friend.creator.id === currentUser.id) {
            userIds.push(friend.receiver.id);
          } else if (friend.receiver.id === currentUser.id) {
            userIds.push(friend.creator.id);
          }
        })

        return from(this.userRepository.findByIds(userIds))
      })
    )
  }
}
