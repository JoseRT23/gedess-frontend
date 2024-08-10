import { Routes } from '@angular/router';
import { publicGuard } from '../shared/guards/public.guard';

export const authRoutes: Routes = [
    { path: 'login', canActivate: [publicGuard], loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent) },
    { path: 'register', canActivate: [publicGuard], loadComponent: () => import('./pages/register/register.component').then(c => c.RegisterComponent) },
    { path: '**', redirectTo: 'login' },
];
