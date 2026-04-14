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
    password: ['', Validators.required],
    cin: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]]
  });

  submit() {
    if (this.form.invalid) return;

    const { email, password, cin } = this.form.value;

    const success = this.auth.login(email!, password!);

    if (success) {
      // Extract the name from email (before @) for display
      const nameFromEmail = email!.split('@')[0];
      
      // Store user data in auth service for use throughout the app
      this.auth.setCurrentUser({
        cin: parseInt(cin!, 10),
        name: nameFromEmail,
        email: email!
      });

      this.router.navigate(['/']);
    }
  }
}