import { Injectable } from '@angular/core';
import { CanMatch, Router, UrlTree } from '@angular/router';
import { UserAuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class NoUserGuard implements CanMatch {

  constructor(private auth: UserAuthService, private router: Router) {}

  canMatch(): boolean | UrlTree {
    return this.auth.isLoggedIn()
      ? this.router.parseUrl('/')
      : true;
  }
}