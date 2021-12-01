import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { Conversation } from '../../models/Conversation';
import { Message } from '../../models/Message';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @ViewChild('form')
  form: NgForm;

  private userImagePathSubsciption: Subscription;
  private userIdSubsciption: Subscription;
  private friendsSubsciption: Subscription;
  private friendSubsciption: Subscription;
  private messageSubsciption: Subscription;
  private conversationSubsciption: Subscription;
  private newMessageSubsciption: Subscription;

  userFullImagePath: string;
  userId: number;

  conversations$: Observable<Conversation[]>;
  conversations: Conversation[] = [];
  conversation: Conversation;

  newMessage$: Observable<string>;
  messages: Message[] = [];

  friends: User[];
  friend: User;
  friend$: BehaviorSubject<User> = new BehaviorSubject<User>({});
  selectedConversationIndex: number = 0;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ionViewDidEnter() {
    this.userImagePathSubsciption =
      this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
        this.userFullImagePath = fullImagePath;
      });
    this.userIdSubsciption = this.authService.userId.subscribe(
      (userId: number) => {
        this.userId = userId;
      }
    );
    this.messageSubsciption = this.chatService
      .getConversationMessages()
      .subscribe((messages: Message[]) => {
        messages.forEach((message: Message) => {
          const allMessageIds = this.messages.map(
            (message: Message) => message.id
          );
          if (!allMessageIds.includes(message.id)) this.messages.push(message);
        });
      });
    this.newMessageSubsciption = this.chatService
      .getNewMessage()
      .subscribe((message: Message) => {
        message.createdAt = new Date();

        const allMessageIds = this.messages.map(
          (message: Message) => message.id
        );

        if (!allMessageIds.includes(message.id)) this.messages.push(message);
      });
    this.friendSubsciption = this.friend$.subscribe((friend: any) => {
      if (JSON.stringify(friend) !== '{}')
        this.chatService.joinConversation(this.friend.id);
    });
    this.friendsSubsciption = this.chatService
      .getFriends()
      .subscribe((friends: User[]) => {
        this.friends = friends;

        if (this.friends.length > 0) {
          this.friend = this.friends[0];
          this.friend$.next(this.friend);

          friends.forEach((friend: User) => {
            this.chatService.createConversation(friend);
          });
          this.chatService.joinConversation(this.friend.id);
        }
      });
    this.conversationSubsciption = this.chatService
      .getConversations()
      .subscribe((conversations: Conversation[]) => {
        this.conversations.push(conversations[0]);
      });
  }

  onSubmit() {
    const { message } = this.form.value;

    if (!message) return;

    let conversationIds = [this.userId, this.friend.id].sort();

    this.conversations.forEach((conversation: Conversation) => {
      let userIds = conversation.users.map((user: User) => user.id).sort();

      if (JSON.stringify(conversationIds) === JSON.stringify(userIds))
        this.conversation = conversation;
    });
    this.chatService.sendMessage(message, this.conversation);
    this.form.reset();
  }

  deriveFullImagePath(user: User): string {
    let url = `${environment.baseApiUrl}/feed/image/`;

    if (user.id === this.userId) return this.userFullImagePath;
    else if (user.imagePath) return url + user.imagePath;
    else if (this.friend.imagePath) return url + this.friend.imagePath;
    else return url + 'blank-profile-picture.png';
  }

  openConversation(friend: User, index: number): void {
    this.selectedConversationIndex = index;
    this.chatService.leaveConversation();
    this.friend = friend;
    this.friend$.next(friend);
    this.messages = [];
  }
  ionViewDidLeave() {
    this.userImagePathSubsciption.unsubscribe();
    this.friendSubsciption.unsubscribe();
    this.messageSubsciption.unsubscribe();
    this.userIdSubsciption.unsubscribe();
    this.friendsSubsciption.unsubscribe();
    this.conversationSubsciption.unsubscribe();
    this.newMessageSubsciption.unsubscribe();
  }
}
