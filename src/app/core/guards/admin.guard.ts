import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Bloquea /admin a roles distintos de Admin (mesero/cajero no deben ver el dashboard).
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser()?.role === 'Admin') {
    return true;
  }

  return router.createUrlTree(['/pos-fastfood']);
};
