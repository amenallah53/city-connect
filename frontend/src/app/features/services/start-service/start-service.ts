import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  serviceId: string | null = null;
  serviceName: string = '';
  formReady = false;
  requirements: string[] = [];
  requirementDocuments: Map<number, File> = new Map();
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
    private authService: UserAuthService,
    private cdr: ChangeDetectorRef
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
  }

  ngOnInit(): void {
    console.log('StartService ngOnInit called');
    // Get serviceId from route params
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const idParam = params.get('serviceId');
      console.log('Route params received - serviceId:', idParam);
      this.serviceId = idParam;
      console.log('Parsed serviceId:', this.serviceId);
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

  loadServiceDetails(serviceId: string): void {
    console.log('⭐ loadServiceDetails called with serviceId:', serviceId);
    this.servicesService.getServiceById(String(serviceId)).pipe(takeUntil(this.destroy$)).subscribe({
      next: (service: any) => {
        console.log('⭐ Service data loaded:', service);
        if (service) {
          this.serviceName = service.name || 'Service';
          console.log('⭐ Raw requirements from API:', service.requirements, 'Type:', typeof service.requirements);
          
          // Parse requirements - handle both array and string formats
          if (service.requirements) {
            if (Array.isArray(service.requirements)) {
              // Requirements is already an array from API
              this.requirements = service.requirements.filter((req: any) => req && String(req).trim().length > 0);
              console.log('⭐ Requirements set as array:', this.requirements);
              console.log('⭐ Requirements length:', this.requirements.length);
            } else if (typeof service.requirements === 'string') {
              // Requirements is a comma-separated string
              this.requirements = service.requirements
                .split(',')
                .map((req: string) => req.trim())
                .filter((req: string) => req.length > 0);
              console.log('⭐ Requirements set from string:', this.requirements);
              console.log('⭐ Requirements length:', this.requirements.length);
            }
            
            this.formReady = true;
          } else {
            console.log('⭐ No requirements found in service object');
            this.formReady = true;
          }
          
          console.log('⭐ Before markForCheck - requirements:', this.requirements);
          console.log('⭐ Before markForCheck - requirements.length:', this.requirements.length);
          // Trigger change detection to update template
          this.cdr.markForCheck();
          console.log('⭐ After markForCheck executed');
        }
      },
      error: (err) => {
        console.error('⭐ Error loading service details:', err);
        this.formReady = true;
        this.cdr.markForCheck();
      }
    });
  }

  initializeForm(): void {
    // personalInfoForm is already initialized in constructor
  }

  setFormDisabled(disabled: boolean): void {
    if (disabled) {
      this.personalInfoForm.disable();
    } else {
      this.personalInfoForm.enable();
    }
  }

  onFileSelected(event: any, index: number): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        this.errorMessage = `File size exceeds 10MB limit. Please choose a smaller file.`;
        return;
      }
      
      // Store file in map by requirement index
      this.requirementDocuments.set(index, file);
      this.errorMessage = null;
      this.cdr.markForCheck();
    }
  }

  getRequirementFile(index: number): File | undefined {
    return this.requirementDocuments.get(index);
  }

  selectStep(step: number): void {
    // Only allow steps 1 and 2
    if (step >= 1 && step <= 2) {
      this.currentStep = step;
      this.cdr.markForCheck();
    }
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
        this.cdr.markForCheck();
        return;
      }
    } else if (this.currentStep === 2) {
      // Can proceed to submission from step 2
      this.submitServiceRequest();
      return;
    }

    // Move to next step (from 1 to 2)
    if (this.currentStep < 2) {
      this.selectStep(this.currentStep + 1);
      this.errorMessage = null;
      this.cdr.markForCheck();
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
      this.cdr.markForCheck();
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
      this.cdr.markForCheck();
      return;
    }

    if (!this.serviceId) {
      this.errorMessage = 'Service ID is required';
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.setFormDisabled(true);
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.markForCheck();

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
        this.cdr.markForCheck();
        
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
        this.cdr.markForCheck();
      }
    });
  }
}
