import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// TODO: remove DEV_BYPASS when backend auth is ready
const DEV_BYPASS = false;

export const authGuard: CanActivateFn = () => {
  if (DEV_BYPASS) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
