import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserData {
  cin: number;
  name?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class UserAuthService {

  private USER_TOKEN_KEY = 'user_token';
  private USER_DATA_KEY = 'user_data';

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

  login(email: string, password: string, userData?: UserData): boolean {
    if (!this.isBrowser()) return false;

    if (email && password) {
      const fakeToken = 'user-token-' + Date.now();
      localStorage.setItem(this.USER_TOKEN_KEY, fakeToken);
      
      // Store user data for access throughout the app
      if (userData) {
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
      }
      
      return true;
    }

    return false;
  }

  getCurrentUser(): UserData | null {
    if (!this.isBrowser()) return null;

    const userData = localStorage.getItem(this.USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  setCurrentUser(userData: UserData): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.USER_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }
}