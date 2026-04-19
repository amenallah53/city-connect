import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';  
import { ReactiveFormsModule } from '@angular/forms';
import { LoginProjetDescrip } from '../../shared/components/login-projet-descrip/login-projet-descrip';

 
@Component({
  selector: 'app-create-account',
  imports: [LoginProjetDescrip,RouterModule,ReactiveFormsModule],
  templateUrl: './create-account.html',
  styleUrl: './create-account.css',
})
export class CreateAccount {
  registerForm: FormGroup;
  selectedFile: File | null = null;
  messageerror: string | null = null;
  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      CIN: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.registerForm.invalid || !this.selectedFile) return;

    const formData = {
      ...this.registerForm.value,
      documentUrl: this.selectedFile.name,  // replace with real upload URL later
      role : 'admin' 
    };

    this.authService.register(formData).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => this.messageerror = err.error?.error || 'An error occurred during registration. Please try again.'
    });
  }
}
