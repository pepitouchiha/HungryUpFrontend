import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, CreateUserRequest } from '../../shared/models/user-enterprise-manager.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>('/api/users');
  }

  createUser(data: CreateUserRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>('/api/users', data);
  }

  updateUser(id: number, data: Partial<CreateUserRequest>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`/api/users/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}
