import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Auth Interceptor - Adds authorization token to all HTTP requests
 * and handles 401 unauthorized responses
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Only access localStorage on the browser
  if (isPlatformBrowser(platformId)) {
    // Get token from localStorage
    const token = localStorage.getItem('user_token');
    
    // Clone request and add authorization header if token exists
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  
  // Handle the request and catch errors
  return next(req).pipe(
    catchError((error) => {
      // If 401 Unauthorized, redirect to login
      if (error.status === 401) {
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('user_token');
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
