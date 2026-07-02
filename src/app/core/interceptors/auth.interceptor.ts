import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refreshing = false;
const refreshed$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // No adjuntar el access token a los endpoints públicos de auth.
  const isAuthCall = req.url.includes('/api/auth/');
  const access = auth.accessToken;
  const authReq = access && !isAuthCall
    ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall) {
        return throwError(() => err);
      }

      // Un solo refresh concurrente; el resto de requests esperan el token nuevo.
      if (refreshing) {
        return refreshed$.pipe(
          filter((token): token is string => token !== null),
          take(1),
          switchMap(token =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
          )
        );
      }

      refreshing = true;
      refreshed$.next(null);

      return auth.refresh().pipe(
        switchMap(res => {
          refreshing = false;
          refreshed$.next(res.accessToken);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
        }),
        catchError(refreshErr => {
          refreshing = false;
          auth.logoutLocal();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
