import { Routes } from '@angular/router';
import { Admin } from './admin';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: Admin,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'catalog',
        loadComponent: () => import('./pages/catalog/catalog').then(m => m.Catalog)
      },
      {
        path: 'mesas',
        loadComponent: () => import('./pages/mesas/mesas').then(m => m.Mesas)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then(m => m.Users)
      }
    ]
  }
];
