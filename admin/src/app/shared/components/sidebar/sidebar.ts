import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  expandedMenus: Set<string> = new Set(['services', 'jobs']);
  private router = inject(Router);

  toggleMenu(menu: string) {
    if (this.expandedMenus.has(menu)) {
      this.expandedMenus.delete(menu);
    } else {
      this.expandedMenus.add(menu);
    }
  }

  isExpanded(menu: string): boolean {
    return this.expandedMenus.has(menu);
  }

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
