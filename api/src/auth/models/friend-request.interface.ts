import { User } from "./user.class";

export type FriendRequest_Status = 'not-sent' | 'accepted' | 'pending' | 'declined' | 'waiting-current-user-response';
export interface FriendRequestStatus {
  status?: FriendRequest_Status;
}
export interface FriendRequest {
  id?: number;
  creator?: User;
  receiver?: User;
  status: FriendRequest_Status;
}
