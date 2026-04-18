import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,RouterModule,Router } from '@angular/router';
import { LoginProjetDescrip } from '../../shared/components/login-projet-descrip/login-projet-descrip';
import { AuthService } from '../../../core/services/auth-service';  

@Component({
  selector: 'app-forgot-password-link',
  imports: [RouterModule,LoginProjetDescrip, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password-link.html',
  styleUrl: './forgot-password-link.css',
})
export class ForgotPasswordLink implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService.resetPassword(this.token, this.resetForm.value.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password changed successfully.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Something went wrong';
      }
    });
  }
}
