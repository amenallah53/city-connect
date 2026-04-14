import { Routes } from '@angular/router';
import { PermitsProblemsManagementComponent } from './features/permits-problems-management/permits-problems-management.component';

export const routes: Routes = [
  {
    path: 'permits-problems-management',
    component: PermitsProblemsManagementComponent
  },
  {
    path: '',
    redirectTo: 'permits-problems-management',
    pathMatch: 'full'
  }
];
