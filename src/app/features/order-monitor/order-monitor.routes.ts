import { Routes } from '@angular/router';
import { OrderMonitor } from './order-monitor';

export const ORDER_MONITOR_ROUTES: Routes = [
  {
    path: '',
    component: OrderMonitor,
    children: []
  }
];
