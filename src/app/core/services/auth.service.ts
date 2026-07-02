import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { AuthApiService, AuthResponse } from '../api/auth.api.service';
import {
  LoginCredentials,
  UserEnterpriseManager,
  UserRole
} from '../../shared/models/user-enterprise-manager.model';

const REFRESH_TOKEN_KEY = 'hungryup_refresh_token';
const USER_KEY = 'hungryup_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authApi = inject(AuthApiService);
  private router  = inject(Router);

  // Access token vive solo en memoria (vida corta); el refresh token persiste en localStorage.
  private readonly _accessToken = signal<string | null>(null);
  private readonly _currentUser = signal<UserEnterpriseManager | null>(
    this.loadUserFromStorage()
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken() || !!this.refreshToken);

  get accessToken(): string | null {
    return this._accessToken();
  }

  private get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.authApi.login(credentials).pipe(
      tap(res => {
        this.storeSession(res);
        const landing = res.role === 'Admin' ? '/admin' : '/pos-fastfood';
        this.router.navigate([landing]);
      })
    );
  }

  // Rotación estricta: cada refresh exitoso devuelve un par de tokens nuevo que reemplaza al anterior.
  refresh(): Observable<AuthResponse> {
    const refreshToken = this.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible.'));
    }

    return this.authApi
      .refresh({ refreshToken })
      .pipe(tap(res => this.storeSession(res)));
  }

  logout(): void {
    const refreshToken = this.refreshToken;
    if (refreshToken) {
      this.authApi.logout({ refreshToken }).subscribe();
    }
    this.logoutLocal();
  }

  // Limpia la sesión local sin llamar al backend (usado cuando el refresh ya falló).
  logoutLocal(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  private storeSession(res: AuthResponse): void {
    this._accessToken.set(res.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);

    const user: UserEnterpriseManager = {
      id: res.id,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      role: res.role as UserRole,
      enterpriseId: res.enterpriseId,
      enterpriseName: res.enterpriseName
    };
    this._currentUser.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadUserFromStorage(): UserEnterpriseManager | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserEnterpriseManager) : null;
  }
}
