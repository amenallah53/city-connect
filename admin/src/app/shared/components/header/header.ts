import { Component, OnInit } from '@angular/core';

import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isProfileOpen = false;
  pageTitle = 'Dashboard';

  constructor(private router: Router) { }

  ngOnInit() {
    this.setPageTitle(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setPageTitle(event.urlAfterRedirects);
      });
  }

  private setPageTitle(url: string) {
    const path = url.split('?')[0];          // strip query params
    const segments = path.split('/').filter(s => s);
    const last = segments[segments.length - 1] || 'dashboard';
    // Convert 'types-of-services' → 'Types Of Services'
    this.pageTitle = last
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfile() {
    this.isProfileOpen = false;
  }

  logout() {
    // TODO: inject auth service and call auth.logout()
    this.router.navigate(['/login']);
  }
}
