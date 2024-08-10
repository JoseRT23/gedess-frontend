import { Routes } from '@angular/router';
import { privateGuard } from './shared/guards/private.guard';

export const routes: Routes = [
    { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(r => r.authRoutes)},
    { path: 'dashboard', canActivate: [privateGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent) },
    { path: 'history', canActivate: [privateGuard], loadComponent: () => import('./pages/history/history.component').then(c => c.HistoryComponent) },
    { path: '**', redirectTo: '/dashboard', pathMatch: 'full' },
];
