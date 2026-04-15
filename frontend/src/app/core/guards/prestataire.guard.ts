import { Injectable } from '@angular/core';
import { CanMatch, Router, UrlTree } from '@angular/router';
import { UserAuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PrestataireGuard implements CanMatch {

  constructor(private auth: UserAuthService, private router: Router) {}

  canMatch(): boolean | UrlTree {
    console.log('PrestataireGuard check:', this.auth.isLoggedUserPrestataire());
    return this.auth.isLoggedIn() && this.auth.isLoggedUserPrestataire()
      ? true
      : this.router.parseUrl('/');
  }
}