import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private authService = inject(AuthService);

  protected user = this.authService.currentUser;

  protected navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/catalog',   label: 'Catálogo',  icon: '🗂️' },
    { path: '/admin/mesas',     label: 'Mesas',     icon: '🍽️' },
    { path: '/admin/users',     label: 'Usuarios',  icon: '👥' },
  ];

}
