import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const publicGuard: CanActivateFn = (route, state) => {
  const user = JSON.parse(localStorage.getItem('user')!);
  const router = inject(Router);

  if (user) {
    router.navigate(['auth', 'login']);
    return false;
  }

  return true;
};
