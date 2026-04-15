import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-form-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form-dialog.html',
  styleUrl: './user-form-dialog.css'
})
export class UserFormDialog implements OnInit {
  isEditMode = false;

  formData: Partial<User> = {
    firstName: '',
    lastName: '',
    email: '',
    cin: '',
    role: 'citoyen',
    status: 'pending'
  };

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) { }

  ngOnInit() {
    if (this.config.data?.user) {
      this.isEditMode = true;
      // Copy data to avoid modifying the original before saving
      this.formData = { ...this.config.data.user };
    }
  }

  save() {
    // In a real app, call service here.
    // We just close and pass the data back.
    this.ref.close(this.formData);
  }
}
