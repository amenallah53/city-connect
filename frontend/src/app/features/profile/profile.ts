import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, UserProfile } from '../../core/services/profile.service';
import { TicketService } from '../../core/services/ticket.service';
import { UserAuthService } from '../../core/services/auth.service';
import { LucideAngularModule, User as UserIcon, Mail, CreditCard, Lock, Edit2, Save, X, Key, CheckCircle } from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  userProfile: UserProfile | null = null;
  isLoading = true;
  isEditing = false;
  profileForm!: FormGroup;
  statusMessage: { type: 'success' | 'error', text: string } | null = null;

  // Icons
  UserIcon = UserIcon;
  MailIcon = Mail;
  CinIcon = CreditCard;
  LockIcon = Lock;
  EditIcon = Edit2;
  SaveIcon = Save;
  CancelIcon = X;
  KeyIcon = Key;
  SuccessIcon = CheckCircle;

  constructor(
    private profileService: ProfileService,
    private authService: UserAuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  loadData(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile data:', err);
        this.isLoading = false;
        this.statusMessage = { type: 'error', text: 'Failed to load profile data' };
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.userProfile) {
      this.profileForm.patchValue({
        firstName: this.userProfile.firstName,
        lastName: this.userProfile.lastName,
        email: this.userProfile.email,
        newPassword: '',
        confirmPassword: ''
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const val = this.profileForm.value;
    const updateData: any = {
      first_name: val.firstName,
      last_name: val.lastName,
      email: val.email
    };

    if (val.newPassword) {
      updateData.newPassword = val.newPassword;
      updateData.confirmPassword = val.confirmPassword;
    }

    this.isLoading = true;
    this.profileService.updateProfile(updateData).subscribe({
      next: () => {
        this.statusMessage = { type: 'success', text: 'Profile updated successfully' };
        this.isEditing = false;
        this.loadData();
        setTimeout(() => this.statusMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.isLoading = false;
        this.statusMessage = { type: 'error', text: err.error?.error || 'Failed to update profile' };
        setTimeout(() => this.statusMessage = null, 5000);
      }
    });
  }

  getInitials(): string {
    if (!this.userProfile) return 'U';
    const first = this.userProfile.firstName?.charAt(0) || '';
    const last = this.userProfile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }
}
