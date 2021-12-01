import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { environment } from 'src/environments/environment';
import { FriendRequest, FriendRequestStatus } from '../models/FriendRequest';

@Injectable({
  providedIn: 'root'
})
export class ConnectionProfileService {
  friendRequests: FriendRequest[];

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  constructor(private httpService: HttpClient) { }

  getConnectionUser(id: number): Observable<User> {
    return this.httpService.get<User>(`${environment.baseApiUrl}/user/${id}`);
  }

  getFriendRequestStatus(id: number): Observable<FriendRequestStatus> {
    return this.httpService.get<FriendRequestStatus>(`${environment.baseApiUrl}/user/friend-request/status/${id}`);
  }

  addConnectionUser(id: number): Observable<FriendRequest | { error: string }> {
    return this.httpService.post<FriendRequest | { error: string }>(
      `${environment.baseApiUrl}/user/friend-request/send/${id}`,
      {}, this.httpOptions
    );
  }

  getFriendRequests(): Observable<FriendRequest[]> {
    return this.httpService.get<FriendRequest[]>(`${environment.baseApiUrl}/user/friend-request/me/received-requests`)
  }

  responseToFriendRequest(id: number, statusResponse: 'accepted' | 'declined'): Observable<FriendRequest> {
    return this.httpService.put<FriendRequest>(`${environment.baseApiUrl}/user/friend-request/response/${id}`,
    { status: statusResponse}, this.httpOptions);
  }
}
