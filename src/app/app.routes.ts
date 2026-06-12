import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'pos-fastfood',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/pos-fastfood/pos-fastfood.routes').then(m => m.POS_FASTFOOD_ROUTES)
  },
  {
    path: 'pos-gourmet',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/pos-gourmet/pos-gourmet.routes').then(m => m.POS_GOURMET_ROUTES)
  },
  {
    path: 'order-monitor',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/order-monitor/order-monitor.routes').then(m => m.ORDER_MONITOR_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
