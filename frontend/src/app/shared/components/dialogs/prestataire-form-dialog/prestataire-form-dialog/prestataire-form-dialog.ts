import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { UserAuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/shared/models/user.model';
import { Prestataire } from 'src/app/shared/models/prestataire.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface ReachOption { name: string; code: 'new' | 'recommended' | 'on-demand'; }

@Component({
  selector: 'app-prestataire-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, TextareaModule, SelectModule],
  templateUrl: './prestataire-form-dialog.html',
  styleUrl: './prestataire-form-dialog.css',
})
export class PrestataireFormDialog implements OnInit {
  currentUser!: User;

  // Pre-filled & locked from current user
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  cin: string = '';
  telephone: string = '';
  addresse: string = '';

  // New fields to fill
  specialty: string = '';
  description: string = '';
  selectedReach: ReachOption = { name: 'New', code: 'new' };
  socialLinksRaw: string = ''; // comma-separated input → split on submit
  extraDocumentFile: File | null = null;

  // Track field disabling states
  isFirstNameDisabled = false;
  isLastNameDisabled = false;
  isEmailDisabled = false;
  isCinDisabled = false;
  isTelephoneDisabled = false;
  isAddresseDisabled = false;

  reachOptions: ReachOption[] = [
    { name: 'New', code: 'new' },
    { name: 'Recommended', code: 'recommended' },
    { name: 'On Demand', code: 'on-demand' },
  ];

  constructor(
    private authService: UserAuthService,
    private ref: DynamicDialogRef,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentLoggedUser().subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.firstName = user.firstName || '';
        this.lastName = user.lastName || '';
        this.email = user.email || '';
        this.cin = user.cin || '';
        this.telephone = user.telephone || '';
        this.addresse = user.addresse || '';

        // Dynamic disabling: if field is already filled, lock it
        this.isFirstNameDisabled = !!this.firstName;
        this.isLastNameDisabled = !!this.lastName;
        this.isEmailDisabled = !!this.email;
        this.isCinDisabled = !!this.cin;
        this.isTelephoneDisabled = !!this.telephone;
        this.isAddresseDisabled = !!this.addresse;
        this.cdr.markForCheck();
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.extraDocumentFile = input.files?.[0] ?? null;
  }

  onSubmit(): void {
    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      cin: this.cin,
      telephone: this.telephone,
      addresse: this.addresse,
      specialty: this.specialty,
      description: this.description,
      reach: this.selectedReach.code,
      socialLinks: this.socialLinksRaw
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0),
      document: this.extraDocumentFile ? this.extraDocumentFile.name : null,
      documentType: this.extraDocumentFile ? this.extraDocumentFile.type : null,
    };

    console.log('📋 Submitting Prestataire Registration:', payload);

    this.http.post(environment.prestatairesUrl, payload).subscribe({
      next: (response: any) => {
        console.log('✅ Prestataire registered successfully:', response);
        this.ref.close(response.data);
      },
      error: (err) => {
        console.error('❌ Failed to register prestataire:', err);
      }
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}