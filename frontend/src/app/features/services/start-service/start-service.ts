import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceRequestsService } from '../../../core/services/service-requests.service';
import { ServicesService } from '../../../core/services/services.service';
import { UserAuthService } from '../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-start-service',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './start-service.html',
  styleUrl: './start-service.css',
})
export class StartService implements OnInit, OnDestroy {
  currentStep: number = 1;
  personalInfoForm: FormGroup;
  requiredDataForm: FormGroup;
  documentsForm: FormGroup;
  serviceId: number | null = null;
  serviceName: string = '';
  formReady = false;
  requirements: string[] = [];
  uploadedDocuments: File[] = [];
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private serviceRequestsService: ServiceRequestsService,
    private servicesService: ServicesService,
    private authService: UserAuthService
  ) {
    // Check if user is logged in on initialization
    const isLoggedIn = this.authService.isLoggedIn();
    
    // Initialize forms in constructor to ensure controls are available immediately
    this.personalInfoForm = this.formBuilder.group({
      // Disable CIN and Name only if user is already logged in
      cin: [{ value: '', disabled: isLoggedIn }, [Validators.required, Validators.pattern(/^\d{8}$/)]],
      name: [{ value: '', disabled: isLoggedIn }, [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      requestdescription: ['']
    });

    this.requiredDataForm = this.formBuilder.group({});
    this.documentsForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // Get serviceId from route params
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.serviceId = Number(params.get('serviceId')) || null;
      if (this.serviceId) {
        this.loadServiceDetails(this.serviceId);
      }
    });
    
    this.initializeForm();
    
    // Pre-fill form with logged-in user data if available
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.personalInfoForm.patchValue({
        cin: currentUser.cin,
        name: currentUser.name || ''
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServiceDetails(serviceId: number): void {
    this.servicesService.getServiceById(String(serviceId)).pipe(takeUntil(this.destroy$)).subscribe({
      next: (service: any) => {
        if (service) {
          this.serviceName = service.name || 'Service';
          // Parse requirements string into array
          if (service.requirements) {
            this.requirements = service.requirements
              .split(',')
              .map((req: string) => req.trim())
              .filter((req: string) => req.length > 0);
            
            // Create form controls for each requirement
            this.createRequirementFormControls();
            this.formReady = true;
          } else {
            this.formReady = true;
          }
        }
      },
      error: (err) => {
        console.error('Error loading service details:', err);
        this.formReady = true;
      }
    });
  }

  createRequirementFormControls(): void {
    const requirementControls: { [key: string]: any } = {};
    this.requirements.forEach((req, index) => {
      const controlName = `requirement_${index}`;
      requirementControls[controlName] = ['', Validators.required];
    });
    
    // If requirements exist, update the form or create new one
    if (Object.keys(requirementControls).length > 0) {
      this.requiredDataForm = this.formBuilder.group(requirementControls);
    }
  }

  initializeForm(): void {
    // personalInfoForm is already initialized in constructor
    // Only reinitialize the dynamic requirement form if needed
    if (this.requirements.length === 0) {
      this.requiredDataForm = this.formBuilder.group({});
    }
  }

  setFormDisabled(disabled: boolean): void {
    if (disabled) {
      this.personalInfoForm.disable();
      this.requiredDataForm.disable();
      this.documentsForm.disable();
    } else {
      this.personalInfoForm.enable();
      this.requiredDataForm.enable();
      this.documentsForm.enable();
    }
  }

  onFileSelect(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedDocuments.push(files[i]);
      }
    }
  }

  removeDocument(index: number): void {
    this.uploadedDocuments.splice(index, 1);
  }

  selectStep(step: number): void {
    this.currentStep = step;
  }

  onContinue(): void {
    // Validate current step before proceeding
    if (this.currentStep === 1) {
      if (!this.personalInfoForm.valid) {
        // Mark all fields as touched to show validation errors
        Object.keys(this.personalInfoForm.controls).forEach(key => {
          this.personalInfoForm.get(key)?.markAsTouched();
        });
        this.errorMessage = 'Please fill in all required fields correctly';
        return;
      }
    } else if (this.currentStep === 2) {
      if (this.requirements.length > 0 && !this.requiredDataForm.valid) {
        Object.keys(this.requiredDataForm.controls).forEach(key => {
          this.requiredDataForm.get(key)?.markAsTouched();
        });
        this.errorMessage = 'Please fill in all required data fields';
        return;
      }
    }

    if (this.currentStep < 3) {
      this.selectStep(this.currentStep + 1);
      this.errorMessage = null;
    } else {
      // Submit form and create service request
      this.submitServiceRequest();
    }
  }

  onReturn(): void {
    if (this.currentStep > 1) {
      this.selectStep(this.currentStep - 1);
    } else {
      // Go back to services page
      this.router.navigate(['/services']);
    }
  }

  submitServiceRequest(): void {
    // Use getRawValue() to include disabled controls (cin and name are disabled)
    const formData = this.personalInfoForm.getRawValue();

    // Check if user has provided CIN (required for submission)
    if (!formData.cin) {
      this.errorMessage = 'CIN is required to submit the service request. Please log in or enter your CIN.';
      this.currentStep = 1;
      return;
    }

    // Validate all forms
    if (!this.personalInfoForm.valid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.personalInfoForm.controls).forEach(key => {
        this.personalInfoForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Please fill in all personal information fields correctly';
      this.currentStep = 1;
      return;
    }

    if (this.requirements.length > 0 && !this.requiredDataForm.valid) {
      Object.keys(this.requiredDataForm.controls).forEach(key => {
        this.requiredDataForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Please fill in all required data fields';
      this.currentStep = 2;
      return;
    }

    if (!this.serviceId) {
      this.errorMessage = 'Service ID is required';
      return;
    }

    this.isSubmitting = true;
    this.setFormDisabled(true);
    this.errorMessage = null;
    this.successMessage = null;

    // Create request object with all data
    const requestPayload: any = {
      cin: formData.cin ? parseInt(formData.cin) : null,
      service_id: this.serviceId,
      description: formData.requestdescription || ''
    };
    
    this.serviceRequestsService.createServiceRequest(requestPayload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.setFormDisabled(false);
        this.successMessage = 'Your service request has been submitted successfully!';
        
        // Reset form and redirect to my-requests after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/my-requests']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.setFormDisabled(false);
        console.error('Error submitting service request:', error);
        this.errorMessage = error.error?.message || 'Failed to submit service request. Please try again.';
      }
    });
  }
}
