import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/pos-fastfood',  label: 'Fast Food', icon: '🍔' },
  { path: '/pos-gourmet',   label: 'Gourmet',   icon: '🍷' },
  { path: '/order-monitor', label: 'Monitor',   icon: '📋' },
  { path: '/admin',         label: 'Admin',     icon: '⚙️', adminOnly: true },
];

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss'
})
export class BottomNav {
  private authService = inject(AuthService);
  private user = this.authService.currentUser;

  protected navItems = computed(() => {
    const isAdmin = this.user()?.role === 'Admin';
    return NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);
  });

  protected logout(): void {
    this.authService.logout();
  }
}
