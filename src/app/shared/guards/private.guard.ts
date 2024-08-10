import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

export const privateGuard: CanActivateFn = (route, state) => {
  const user = JSON.parse(localStorage.getItem('user')!);
  const router = inject(Router);
  
  if (!user) {
    router.navigate(['auth', 'login']);
    return false;
  }

  return true;
};
