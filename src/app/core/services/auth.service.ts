import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class UserAuthService {

  private USER_TOKEN_KEY = 'user_token';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return true; 
      // Allow SSR to render.
      // Real check happens in browser after hydration.
    }

    return !!localStorage.getItem(this.USER_TOKEN_KEY);
  }

  login(email: string, password: string): boolean {
    if (!this.isBrowser()) return false;

    if (email && password) {
      const fakeToken = 'user-token-' + Date.now();
      localStorage.setItem(this.USER_TOKEN_KEY, fakeToken);
      return true;
    }

    return false;
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.USER_TOKEN_KEY);
  }
}