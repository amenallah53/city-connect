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
        path: 'faq',
        loadComponent: () =>
          import('./features/faq/faq').then(m => m.Faq)
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