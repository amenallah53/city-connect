import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from 'src/app/shared/models/user.model';

export interface UserData {
  cin: number;
  name?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class UserAuthService {

  private USER_TOKEN_KEY = 'user_token';
  private USER_DATA_KEY = 'user_data';
  private API_URL = 'http://localhost:5002';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private extractUserDataFromToken(token: string): UserData | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return {
        cin: decoded.cin ? Number(decoded.cin) : 0,
        email: decoded.email,
        name: decoded.name
      };
    } catch (err) {
      console.error('Failed to extract user data from token:', err);
      return null;
    }
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
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem(this.USER_TOKEN_KEY);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.USER_TOKEN_KEY, response.token);
          // Extract user data from JWT token
          const userData = this.extractUserDataFromToken(response.token);
          if (userData) {
            this.setCurrentUser(userData);
          }
        }
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.API_URL}/me/password`, { token, newPassword, confirmPassword: newPassword });
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
  getToken(): string | null {
    return localStorage.getItem(this.USER_TOKEN_KEY);
  }

  forgotPassword(email: string): Observable<any> {
  return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  register(data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstname: string;
    lastname: string;
    CIN: string;
    documentUrl: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.API_URL}/google`, { idToken }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.USER_TOKEN_KEY, response.token);
          // Extract user data from JWT token
          const userData = this.extractUserDataFromToken(response.token);
          if (userData) {
            this.setCurrentUser(userData);
          }
        }
      })
    );
  }
}