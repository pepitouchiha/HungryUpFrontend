import { Routes } from '@angular/router';
import { PosGourmet } from './pos-gourmet';

export const POS_GOURMET_ROUTES: Routes = [
  {
    path: '',
    component: PosGourmet,
    children: []
  }
];
