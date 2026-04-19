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
    this.personalInfoForm = this.formBuilder.group({
      cin: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      date_naissance: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      requestdescription: ['']
    });
  }

  ngOnInit(): void {
    // Get serviceId from route params
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.serviceId = params.get('serviceId');
      if (this.serviceId) {
        this.loadServiceDetails(this.serviceId);
      }
    });

    // Pre-fill form with logged-in user data
    this.authService.getCurrentLoggedUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.personalInfoForm.patchValue({
          cin: user.cin,
          name: `${user.firstName} ${user.lastName}`,
          address: user.addresse || '',
          date_naissance: user.date_naissance || '',
          phone: user.telephone || ''
        });

        // Disable locked fields
        this.personalInfoForm.get('cin')?.disable();
        this.personalInfoForm.get('name')?.disable();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServiceDetails(serviceId: string): void {
    this.servicesService.getServiceById(String(serviceId)).pipe(takeUntil(this.destroy$)).subscribe({
      next: (service: any) => {
        if (service) {
          this.serviceName = service.name || 'Service';
          
          if (service.requirements) {
            if (Array.isArray(service.requirements)) {
              this.requirements = service.requirements.filter((req: any) => req && String(req).trim().length > 0);
            } else if (typeof service.requirements === 'string') {
              this.requirements = service.requirements
                .split(',')
                .map((req: string) => req.trim())
                .filter((req: string) => req.length > 0);
            }
          }
          this.formReady = true;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Error loading service details:', err);
        this.formReady = true;
        this.cdr.markForCheck();
      }
    });
  }

  onFileSelected(event: any, index: number): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.errorMessage = `File size exceeds 10MB limit.`;
        return;
      }
      this.requirementDocuments.set(index, file);
      this.errorMessage = null;
      this.cdr.markForCheck();
    }
  }

  getRequirementFile(index: number): File | undefined {
    return this.requirementDocuments.get(index);
  }

  selectStep(step: number): void {
    if (step >= 1 && step <= 2) {
      this.currentStep = step;
      this.cdr.markForCheck();
    }
  }

  onContinue(): void {
    if (this.currentStep === 1) {
      if (!this.personalInfoForm.valid && !this.personalInfoForm.disabled) {
        Object.keys(this.personalInfoForm.controls).forEach(key => {
          this.personalInfoForm.get(key)?.markAsTouched();
        });
        this.errorMessage = 'Please fill in all required fields correctly';
        return;
      }
    } else if (this.currentStep === 2) {
      this.submitServiceRequest();
      return;
    }

    if (this.currentStep < 2) {
      this.currentStep++;
      this.errorMessage = null;
      this.cdr.markForCheck();
    }
  }

  onReturn(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.router.navigate(['/services']);
    }
  }

  submitServiceRequest(): void {
    const formData = this.personalInfoForm.getRawValue();

    if (!formData.cin) {
      this.errorMessage = 'CIN is required';
      this.currentStep = 1;
      return;
    }

    if (!this.serviceId) {
      this.errorMessage = 'Service ID is required';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const attachmentFiles = Array.from(this.requirementDocuments.values());
    const requestPayload: any = {
      cin: formData.cin ? parseInt(formData.cin) : null,
      service_id: this.serviceId,
      description: formData.requestdescription || '',
      telephone: formData.phone || null,
      addresse: formData.address || null,
      date_naissance: formData.date_naissance || null,
      name: formData.name || null,
      attachments: attachmentFiles
    };
    
    this.serviceRequestsService.createServiceRequest(requestPayload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Your service request has been submitted successfully!';
        setTimeout(() => {
          this.router.navigate(['/services/requests']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error submitting service request:', error);
        this.errorMessage = error.error?.message || 'Failed to submit service request.';
        this.cdr.markForCheck();
      }
    });
  }
}
