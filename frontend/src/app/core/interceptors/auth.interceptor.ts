import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Auth Interceptor - Adds authorization token to all HTTP requests
 * and handles 401 unauthorized responses
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
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
  
  // Handle the request and catch errors
  return next(req).pipe(
    catchError((error) => {
      // If 401 Unauthorized, redirect to login
      if (error.status === 401) {
        localStorage.removeItem('user_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
