import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { UserAuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/shared/models/user.model';
import { Prestataire } from 'src/app/shared/models/prestataire.model';

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

  reachOptions: ReachOption[] = [
    { name: 'New', code: 'new' },
    { name: 'Recommended', code: 'recommended' },
    { name: 'On Demand', code: 'on-demand' },
  ];

  constructor(
    private authService: UserAuthService,
    private ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentLoggedUser();
    this.firstName = this.currentUser.firstName;
    this.lastName = this.currentUser.lastName;
    this.email = this.currentUser.email;
    this.cin = this.currentUser.cin;
    this.telephone = this.currentUser.telephone ?? '';
    this.addresse = this.currentUser.addresse ?? '';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.extraDocumentFile = input.files?.[0] ?? null;
  }

  onSubmit(): void {
    const prestataire: Prestataire = {
      // From current user (locked)
      id: this.currentUser.id,
      cin: this.currentUser.cin,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      addresse: this.addresse,
      telephone: this.telephone,
      role: 'prestataire',
      createdAt: this.currentUser.createdAt,

      // Always pending on new submission
      status: 'pending',

      // From form
      specialty: this.specialty,
      description: this.description,
      reach: this.selectedReach.code,
      socialLinks: this.socialLinksRaw
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0),
      document: this.extraDocumentFile
        ? `[file: ${this.extraDocumentFile.name}]`
        : undefined,
      submissionDate: new Date(),
      rating: 0,
    };

    console.log('📋 New Prestataire Submission:', prestataire);
    this.ref.close(prestataire);
  }

  onCancel(): void {
    this.ref.close();
  }
}