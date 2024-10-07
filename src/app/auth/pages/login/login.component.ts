import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  public _pattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

  formLogin: FormGroup = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this._pattern)]],
    password: ['', Validators.required],
  });

  constructor(private _fb: FormBuilder, 
              private _authService: AuthService,
              private _router: Router) { }

  public errormessage: string = '';

  public login(): void {
    this.errormessage = '';
    if (this.formLogin.get('email')?.hasError('pattern')) return;       
    
    if (this.formLogin.invalid) {
      this.errormessage = 'Datos ingresados incompletos';
      return;
    }

    const credentials = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password
    }

    this._authService.login(credentials)
    .subscribe({
      next: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this._authService.setCurrentUser();
        this._router.navigate(['dashboard']);
      },
      error: (error) => {
        this.errormessage = error.error.message;
      }
    });
  }
}
