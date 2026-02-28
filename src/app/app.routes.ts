import { Routes } from '@angular/router';
import { NoUserGuard } from './core/guards/no-user.guard';
import { UserGuard } from './core/guards/user.guard';

export const routes: Routes = [

  // =====================
  // PUBLIC
  // =====================
  {
    path: 'login',
    canMatch: [NoUserGuard],
    loadComponent: () =>
      import('./layouts/simple-layout/simple-layout').then(m => m.SimpleLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/login/login').then(m => m.Login)
      }
    ]
  },

  // =====================
  // PROTECTED
  // =====================
  {
    path: '',
    canMatch: [UserGuard],
    loadComponent: () =>
      import('./layouts/default-layout/default-layout').then(m => m.DefaultLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home').then(m => m.Home)
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/jobs').then(m => m.Jobs)
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services').then(m => m.Services)
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./features/faq/faq').then(m => m.Faq)
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./features/report/report').then(m => m.Report)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then(m => m.Profile)
      }
    ]
  },

  // =====================
  // CATCH ALL
  // =====================
  {
    path: '**',
    redirectTo: ''
  }
];