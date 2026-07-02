import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = '/api/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  enterpriseId: number;
  enterpriseName: string;
  accessToken: string;
  accessTokenExpiration: string;
  refreshToken: string;
  refreshTokenExpiration: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/login`, dto);
  }

  refresh(dto: RefreshRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/refresh`, dto);
  }

  logout(dto: LogoutRequest): Observable<void> {
    return this.http.post<void>(`${BASE}/logout`, dto);
  }
}
