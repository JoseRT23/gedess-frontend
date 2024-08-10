import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { catchError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  formLogin: FormGroup = this._fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(private _fb: FormBuilder, 
              private _authService: AuthService,
              private _router: Router) { }

  public errormessage: string = '';

  public login(): void {
    this.errormessage = '';
    if (this.formLogin.invalid) {
      this.errormessage = 'Datos ingresados incompletos';
    }

    const credentials = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password
    }

    this._authService.login(credentials)
      .pipe(
        catchError(err => this.errormessage = err.error.message)
      )
      .subscribe(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this._authService.setCurrentUser();
          this._router.navigate(['dashboard']);
        }
      });
    
  }
}
