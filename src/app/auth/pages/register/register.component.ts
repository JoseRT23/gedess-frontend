import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup = this._fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(private _fb: FormBuilder, 
              private _authService: AuthService,
              private _router: Router) { }

  public errormessage: string = '';

  public register(): void {
    this.errormessage = '';
    if (this.registerForm.invalid) {
      this.errormessage = 'Datos ingresados incompletos';
      return;
    }

    const user = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    }

    this._authService.register(user)
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
