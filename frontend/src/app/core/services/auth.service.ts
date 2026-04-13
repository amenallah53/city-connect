import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserAuthService {

  private USER_TOKEN_KEY = 'user_token';
  private apiUrl = environment.authUrl;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return true; 
    }

    return !!localStorage.getItem(this.USER_TOKEN_KEY);
  }

  login(email: string, password: string): Observable<any> {
    if (!this.isBrowser()) return of(false);

    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem(this.USER_TOKEN_KEY, res.token);
        }
      })
    );
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.USER_TOKEN_KEY);
  }
}