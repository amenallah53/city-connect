import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, CanActivateChild } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private check(): boolean {
  if (!isPlatformBrowser(this.platformId)) return false;

  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) {
    localStorage.setItem('token', urlToken);
    window.history.replaceState({}, '', window.location.pathname); // clean URL
  }

  // Now check localStorage as usual
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.role === 'admin') return true;
    } catch {}
  }

  window.location.href = 'http://localhost:4200/login';
  return false;
}

  canActivate(): boolean { return this.check(); }
  canActivateChild(): boolean { return this.check(); }
}