import { Routes } from '@angular/router';
import { PosFastfood } from './pos-fastfood';

export const POS_FASTFOOD_ROUTES: Routes = [
  {
    path: '',
    component: PosFastfood,
    children: []
  }
];
