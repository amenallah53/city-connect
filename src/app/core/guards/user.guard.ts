import { Injectable } from '@angular/core';
import { CanMatch, Router, UrlTree } from '@angular/router';
import { UserAuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanMatch {

  constructor(private auth: UserAuthService, private router: Router) {}

  canMatch(): boolean | UrlTree {
    console.log('UserGuard check:', this.auth.isLoggedIn());
    return this.auth.isLoggedIn()
      ? true
      : this.router.parseUrl('/login');
  }
}