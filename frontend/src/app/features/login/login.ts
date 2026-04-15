import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserAuthService } from '../../core/services/auth.service';
import { LoginProjetDescrip } from '../../shared/components/login-projet-descrip/login-projet-descrip';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, LoginProjetDescrip, RouterModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private fb = inject(FormBuilder);
  private auth = inject(UserAuthService);
  private router = inject(Router);

  errorMessage: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });


  submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();

    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => console.error(err.error?.message),
    });
  }
}