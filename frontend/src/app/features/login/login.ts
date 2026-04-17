import { Component, inject,ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserAuthService } from '../../core/services/auth.service';
import { LoginProjetDescrip } from '../../shared/components/login-projet-descrip/login-projet-descrip';

declare const google: any;
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
  private cdr = inject(ChangeDetectorRef);
  

  errorMessage: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });


  submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();

    this.auth.login(email!, password!).subscribe({
      next: (res) => 
      {
        this.errorMessage = null;
        this.cdr.detectChanges();
        if(res.user.role === 'prestataire' || res.user.role === 'citoyen') {
          this.router.navigate(['/home']);
        } else if(res.user.role === 'admin') {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Login failed';
        this.cdr.detectChanges();
      }
    });
  }

  loginWithGoogle() {
    google.accounts.id.initialize({
      client_id: '21728055963-58jhr12pdf9mar7kcgonrb08dpsc466i.apps.googleusercontent.com',
      callback: (response: any) => {
        this.auth.googleLogin(response.credential).subscribe({
          next: (res) => {
            this.errorMessage = null;
            this.cdr.detectChanges();
            if(res.user.role === 'prestataire' || res.user.role === 'citoyen') {
              this.router.navigate(['/home']);
            } else if(res.user.role === 'admin') {
              this.router.navigate(['/dashboard']);
            }
          },
          error: (err) => {
            this.errorMessage = err.error?.error || 'Google login failed';
            this.cdr.detectChanges();
          }
        });
      }
    });
    google.accounts.id.prompt(); 
  }
}