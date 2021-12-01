import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { of, Subscription, take, tap } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/auth/models/user.class';
import { AuthService } from 'src/auth/services/auth.service';
import { ActiveConversation } from '../models/active-conversation.interface';
import { Message } from '../models/message.interface';
import { ConversationService } from '../services/conversation.service';

@WebSocketGateway({ cors: { origin: ['http://localhost:8100'] } })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private authService: AuthService,
    private conversationService: ConversationService,
  ) {}

  onModuleInit() {
    this.conversationService
      .removeActiveConversations()
      .pipe(take(1))
      .subscribe();
    this.conversationService.removeConversatins().pipe(take(1)).subscribe();
    this.conversationService.removeMessages().pipe(take(1)).subscribe();
  }

  @UseGuards(JwtGuard)
  handleConnection(socket: Socket) {
    console.log('connection made');

    const jwt = socket.handshake.headers.authorization || null;
    // console.log('chat-gateway-handle-connection jwt', jwt);

    this.authService.getJwtUser(jwt).subscribe((user: User) => {
      if (!user) {
        console.log('chat-gateway-handle-connection No user');
        this.handleDisconnect(socket);
      } else {
        socket.data.user = user;
        this.getConversations(socket, user.id);
      }
    });
  }

  getConversations(socket: Socket, userId: number): Subscription {
    return this.conversationService
      .getConversationWithUsers(userId)
      .subscribe((conversations) => {
        this.server.to(socket.id).emit('conversations', conversations);
      });
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnected');
    this.conversationService
      .leaveConversation(socket.id)
      .pipe(take(1))
      .subscribe();
  }

  @SubscribeMessage('createConversation')
  createConversation(socket: Socket, friend: User) {
    this.conversationService
      .createConversation(socket.data.user, friend)
      .pipe(take(1))
      .subscribe(() => {
        this.getConversations(socket, socket.data.user.id);
      });
  }
  @SubscribeMessage('sendMessage')
  handleMessage(socket: Socket, newMessage: Message) {
    console.log('chat-gateway-hanldeMussage newMessage', newMessage.message);

    if (!newMessage.conversation) return of(null);

    const { user } = socket.data;
    newMessage.user = user;

    if (newMessage.conversation.id) {
      this.conversationService
        .createMessage(newMessage)
        .pipe(take(1))
        .subscribe((message) => {
          newMessage.id = message.id;
          this.conversationService
            .getActiveUsers(newMessage.conversation.id)
            .pipe(take(1))
            .subscribe((activeConversations: ActiveConversation[]) => {
              activeConversations.forEach(
                (activeConversation: ActiveConversation) => {
                  this.server
                    .to(activeConversation.sockerId)
                    .emit('newMessage', newMessage);
                },
              );
            });
        });
    }
  }

  @SubscribeMessage('joinConversation')
  joinConversation(socket: Socket, friendId) {
    this.conversationService
      .joinConversation(friendId, socket.data.user.id, socket.id)
      .pipe(
        tap((activeConversation: ActiveConversation) => {
          this.conversationService
            .getMessages(activeConversation.conversationId)
            .pipe(take(1))
            .subscribe((messages: Message[]) => {
              this.server.to(socket.id).emit('message', messages);
            });
        }),
      )
      .pipe(take(1))
      .subscribe();
  }

  @SubscribeMessage('leaveConvesation')
  leaveConversation(socket: Socket) {
    this.conversationService
      .leaveConversation(socket.id)
      .pipe(take(1))
      .subscribe();
  }
}
