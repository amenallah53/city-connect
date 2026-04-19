import { Component, OnInit,inject,signal,Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from '../../../models/user.model';
import { UsersServices } from '../../../../core/services/users-services';

@Component({
  selector: 'app-user-form-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form-dialog.html',
  styleUrl: './user-form-dialog.css'
})
export class UserFormDialog implements OnInit {
  @Output() userUpdated = new EventEmitter();
  config = inject(DynamicDialogConfig);
  ref = inject(DynamicDialogRef);
  private usersService = inject(UsersServices);

  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  formData = signal<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    cin: '',
    role: 'citoyen',
    status: 'pending'
  });

  ngOnInit() {
    if (this.config.data?.user) {
      this.isEditMode.set(true);
      this.formData.set({ ...this.config.data.user });
    }
  }

  setField(field: keyof User, value: any) {
    this.formData.update(f => ({ ...f, [field]: value }));
  }

  save() {
    this.error.set(null);
    const data = this.formData();

    // validate before doing anything
    const validationError = this.validate(data);
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    if (this.isEditMode()) {
      if (!data.id) return;
      this.loading.set(true);
      this.usersService.update(data.id, data).subscribe({
        next: () => { this.loading.set(false); this.ref.close(true); },
        error: (err) => { this.error.set(err.error?.error || 'Failed to update user'); this.loading.set(false); }
      });
    } else {
      this.loading.set(true);
      this.usersService.create(data).subscribe({
        next: () => { this.loading.set(false); this.ref.close(true); },
        error: (err) => { this.error.set(err.error?.error || 'Failed to create user'); this.loading.set(false); }
      });
    }
  }

  private validate(data: Partial<User>): string | null {
  if (!data.firstName?.trim()) return 'First name is required';
  if (!data.lastName?.trim())  return 'Last name is required';

  if (!data.email?.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) return 'Invalid email address';

  if (!data.cin?.trim()) return 'CIN is required';
  if (!/^\d{8}$/.test(data.cin)) return 'CIN must be exactly 8 digits';

  return null; // all good
}
}
