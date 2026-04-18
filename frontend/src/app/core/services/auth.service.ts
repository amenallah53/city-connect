import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from 'src/app/shared/models/user.model';

export interface UserData {
  id: string;
  cin: number;
  name?: string;
  email?: string;
  role?: string;
  addresse?: string;
  telephone?: string;
  date_naissance?: string;
}

@Injectable({ providedIn: 'root' })
export class UserAuthService {

  private USER_TOKEN_KEY = 'token';
  private API_URL = 'http://localhost:5002';
  private USER_DATA_KEY = 'userData';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private extractUserDataFromToken(token: string): UserData | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return {
        id: decoded.userId,
        role: decoded.role,
        cin: decoded.cin ? Number(decoded.cin) : 0,
        email: decoded.email,
        name: decoded.name,
        addresse: decoded.addresse || decoded.address,
        telephone: decoded.telephone || decoded.phone,
        date_naissance: decoded.date_naissance
      };
    } catch (err) {
      console.error('Failed to extract user data from token:', err);
      return null;
    }
  }
  getCurrentLoggedUser(): User {
    const userData = this.getCurrentUser();
    
    // Split name into firstName and lastName if possible
    const fullName = userData?.name || '';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: userData?.id || '',
      cin: String(userData?.cin || ''),
      firstName: firstName,
      lastName: lastName,
      email: userData?.email || '',
      role: (userData?.role as 'citoyen' | 'prestataire' | 'admin') || 'citoyen',
      addresse: userData?.addresse || '',
      telephone: userData?.telephone || '',
      date_naissance: userData?.date_naissance || '',
      status: 'accepted',
      createdAt: new Date()
    };
  }

  isLoggedUserPrestataire(): boolean {
    return this.getCurrentUser()?.role === "prestataire";
  }

  /*isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return true;
    }
  }*/

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