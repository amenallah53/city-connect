import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from 'src/app/shared/models/user.model';

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

  getCurrentLoggedUser(): User {
    // this is a helper method where u can get the current user info after logging in
    // with the help of the jwt token return object: mak bch trajaa {key, id, email} (mathalan)
    return {
      id: "1",
      cin: 14674032,
      firstName: "amenallah",
      lastName: "kalai",
      email: "amenkalai53@gmail.com",
      role: "prestataire",
      status: "accepted",
      addresse: "mourouj",
      createdAt: new Date()
    }
  }

  isLoggedUserPrestataire(): boolean {
    return this.getCurrentLoggedUser().role === "prestataire";
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