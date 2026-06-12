import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = '/api/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserSession {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  token: string;
  tokenExpiration: string;
  enterpriseId: number;
  enterpriseName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);

  login(dto: LoginRequest): Observable<UserSession> {
    return this.http.post<UserSession>(`${BASE}/login`, dto);
  }
}
