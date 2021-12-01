import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { Post } from '../models/Post';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient) { }

  getSelectedPosts(params) {
    return this.http.get<Post[]>(`${environment.baseApiUrl}/feed${params}`);
  }

  createPost(body: string) {
    return this.http.post<Post>(`${environment.baseApiUrl}/feed`, 
    { body }, this.httpOptions).pipe(take(1));
  }

  updatePost(postId: number, body: string) {
    return this.http.put(`${environment.baseApiUrl}/feed/${postId}`, { body }, this.httpOptions).pipe(take(1));
  }

  deletePost(postId: number) {
    return this.http.delete(`${environment.baseApiUrl}/feed/${postId}`).pipe(take(1));
  }

}
