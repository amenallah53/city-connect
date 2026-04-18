import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
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
  private API_URL = 'http://localhost:5000';
  private USER_DATA_KEY = 'userData';
  private MYPROFILE_API_URL = 'http://localhost:5000/api/myprofile';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    if (this.isBrowser()) {
      this.refreshCurrentUser().subscribe();
    }
  }

  refreshCurrentUser(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      this.currentUserSubject.next(null);
      return of(null);
    }

    return this.http.get<any>(`${this.MYPROFILE_API_URL}/me`, {
      headers: this.getHeaders()
    }).pipe(
      map(user => {
        const mappedUser: User = {
          ...user,
          role: user.role as 'citoyen' | 'prestataire' | 'admin',
          status: user.status as 'pending' | 'accepted' | 'rejected',
          createdAt: new Date(user.createdAt)
        };
        this.currentUserSubject.next(mappedUser);
        return mappedUser;
      }),
      catchError(err => {
        console.error('Error fetching current user:', err);
        const userData = this.getCurrentUser();
        if (!userData) {
          this.currentUserSubject.next(null);
          return of(null);
        }

        const fullName = userData?.name || '';
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        const fallbackUser: User = {
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
        this.currentUserSubject.next(fallbackUser);
        return of(fallbackUser);
      })
    );
  }

  getCurrentLoggedUser(): Observable<User | null> {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }
    return this.refreshCurrentUser();
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  isLoggedUserPrestataire(): boolean {
    return this.getCurrentUser()?.role === "prestataire";
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem(this.USER_TOKEN_KEY);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/api/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.USER_TOKEN_KEY, response.token);
          const userData = this.extractUserDataFromToken(response.token);
          if (userData) {
            this.setCurrentUser(userData);
            this.refreshCurrentUser().subscribe();
          }
        }
      })
    );
  }


  // Fix 2: read userId correctly from JWT payload
  private extractUserDataFromToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const data = JSON.parse(decodedPayload);
      return {
        id: data.userId || data.id,   // ✅ JWT uses userId
        cin: data.cin,
        name: (data.first_name || '') + ' ' + (data.last_name || ''),
        email: data.email,
        role: data.role,
        addresse: data.adresse,
        telephone: data.telephone,
        date_naissance: data.date_naissance
      };
    } catch (e) {
      console.error('Error extracting user data from token', e);
      return null;
    }
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.API_URL}/api/auth/me/password`, { token, newPassword, confirmPassword: newPassword });
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
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.USER_TOKEN_KEY);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/api/auth/forgot-password`, { email, CLIENT_URL: 'http://localhost:4200' });
  }

  register(data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstname: string;
    lastname: string;
    CIN: string;
    documentUrl: string;
    role : 'citoyen';
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/api/auth/register`, data);
  }

  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.API_URL}/api/auth/google`, { idToken }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.USER_TOKEN_KEY, response.token);
          const userData = this.extractUserDataFromToken(response.token);
          if (userData) {
            this.setCurrentUser(userData);
          }
        }
      })
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}