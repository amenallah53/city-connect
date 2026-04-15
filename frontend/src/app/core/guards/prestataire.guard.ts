import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanMatch, Router, UrlTree } from '@angular/router';
import { UserAuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PrestataireGuard implements CanMatch {

  constructor(
    private auth: UserAuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async canMatch(): Promise<boolean | UrlTree> {
    // On server, allow navigation (will redirect on browser)
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    // Wait for auth initialization
    await firstValueFrom(
      this.auth.isInitialized$.pipe(
        map(initialized => initialized)
      )
    );
    
    console.log('PrestataireGuard check:', this.auth.isLoggedUserPrestataire());
    return this.auth.isLoggedIn() && this.auth.isLoggedUserPrestataire()
      ? true
      : this.router.parseUrl('/');
  }
}