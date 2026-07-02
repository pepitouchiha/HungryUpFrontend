import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, CreateUserRequest, UpdateUserRequest } from '../../shared/models/user-enterprise-manager.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>('/api/v1/users');
  }

  createUser(data: CreateUserRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>('/api/v1/users', data);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`/api/v1/users/${id}`, data);
  }

  changePassword(id: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`/api/v1/users/${id}/password`, { newPassword });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/users/${id}`);
  }
}
