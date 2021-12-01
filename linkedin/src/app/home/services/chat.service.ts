import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { ChatSocketService } from 'src/app/core/chat-socket.service';
import { environment } from 'src/environments/environment';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private socket: ChatSocketService, private http: HttpClient) {}

  sendMessage(message: string, conversation: Conversation): void {
    const newMessage: Message = {
      message,
      conversation,
    };
    console.log('chat-service-sendMessage newMessage', newMessage);

    this.socket.emit('sendMessage', newMessage);
  }

  getNewMessage(): Observable<Message> {
    return this.socket.fromEvent<Message>('newMessage');
  }

  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.baseApiUrl}/user/friends/my`);
  }

  createConversation(friend: User): void {
    this.socket.emit('createConversation', friend);
  }

  joinConversation(friendId: number): void {
    this.socket.emit('joinConversation', friendId);
  }

  leaveConversation(): void {
    this.socket.emit('leaveConversation');
  }

  getConversationMessages(): Observable<Message[]> {
    return this.socket.fromEvent<Message[]>('messages');
  }

  getConversations(): Observable<Conversation[]> {
    return this.socket.fromEvent<Conversation[]>('conversations');
  }
}
