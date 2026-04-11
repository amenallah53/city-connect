import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-service',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './start-service.html',
  styleUrl: './start-service.css',
})
export class StartService implements OnInit {
  currentStep: number = 1;
  personalInfoForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.personalInfoForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      cin: ['', [Validators.required]]
    });
  }

  selectStep(step: number): void {
    this.currentStep = step;
  }

  onContinue(): void {
    if (this.currentStep < 3) {
      this.selectStep(this.currentStep + 1);
    } else {
      // Submit form
      if (this.personalInfoForm.valid) {
        console.log('Form submitted:', this.personalInfoForm.value);
        // Navigate to next page or show success message
      }
    }
  }

  onReturn(): void {
    if (this.currentStep > 1) {
      this.selectStep(this.currentStep - 1);
    } else {
      // Go back to previous page
      this.router.navigate(['/services']);
    }
  }
}
