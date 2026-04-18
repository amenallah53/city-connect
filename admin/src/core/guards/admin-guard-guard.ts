import { Injectable } from '@angular/core';
import { CanMatch, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanMatch {

  constructor(private auth: AuthService, private router: Router) {}

  canMatch(): boolean | UrlTree {
    console.log('AdminGuard check:', this.auth.isLoggedUserAdmin());
    return this.auth.isLoggedIn() && this.auth.isLoggedUserAdmin()
      ? true
      : this.router.parseUrl('/login');
  }
}