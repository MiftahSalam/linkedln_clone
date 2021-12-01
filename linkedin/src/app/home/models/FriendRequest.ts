export type FriendRequest_Status = 'not-sent' | 'accepted' | 'pending' | 'declined' | 'waiting-current-user-response';
export interface FriendRequestStatus {
  status?: FriendRequest_Status;
}
export interface FriendRequest {
  id: number;
  creator: number;
  receiver: number;
  status?: FriendRequest_Status;
}
