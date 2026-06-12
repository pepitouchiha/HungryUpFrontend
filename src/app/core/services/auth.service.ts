import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LoginCredentials,
  UserEnterpriseManager
} from '../../shared/models/user-enterprise-manager.model';

const TOKEN_KEY = 'hungryup_token';
const USER_KEY  = 'hungryup_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly _currentUser = signal<UserEnterpriseManager | null>(
    this.loadFromStorage()
  );

  readonly currentUser     = this._currentUser.asReadonly();
  readonly isAuthenticated = signal(!!this.loadFromStorage());

  login(credentials: LoginCredentials): Observable<UserEnterpriseManager> {
    return this.http
      .post<UserEnterpriseManager>('/api/auth/login', credentials)
      .pipe(tap(user => this.persistSession(user)));
  }

  logout(): void {
    this._currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(user: UserEnterpriseManager): void {
    this._currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.router.navigate(['/admin']);
  }

  private loadFromStorage(): UserEnterpriseManager | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserEnterpriseManager) : null;
  }
}
