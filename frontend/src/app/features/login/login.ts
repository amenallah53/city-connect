import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserAuthService } from '../../core/services/auth.service';
import { LoginProjetDescrip } from '../../shared/components/login-projet-descrip/login-projet-descrip';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,LoginProjetDescrip,RouterModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private fb = inject(FormBuilder);
  private auth = inject(UserAuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        if (res.token) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        // Optionally add an error message to the UI
      }
    });
  }
}