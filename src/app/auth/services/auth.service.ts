import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _http: HttpClient, private _router: Router) { 
    this.setCurrentUser();
  }

  private _baseUrl: string = 'http://localhost:3000/api/';
  private _currentUser = signal<any|null>(null);
  public currentUser = computed(() => this._currentUser());

  setCurrentUser() {
    const localuser = JSON.parse(localStorage.getItem('user')!);
    this._currentUser.set(localuser);
  }

  public login(credentials: any) {
    const url = `${this._baseUrl}auth/login`;
    return this._http.post(url, credentials);
  }

  public register() {}

  public closeSesion() {
    localStorage.removeItem('user');
    this._router.navigate(['auth', 'login']);
  }
}
