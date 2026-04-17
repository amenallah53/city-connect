import { Component, Input } from '@angular/core';
import { User } from '../../../models/user.model';
import { NgClass } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserInfoDialog } from '../../dialogs/user-info-dialog/user-info-dialog';
import { UserFormDialog } from '../../dialogs/user-form-dialog/user-form-dialog';
import { UserDeleteDialog } from '../../dialogs/user-delete-dialog/user-delete-dialog';

@Component({
  selector: 'app-user-card',
  imports: [NgClass],
  providers: [DialogService],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard {
  @Input({ required: true }) user!: User;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(private dialogService: DialogService) {}

  viewInfo() {
    this.dialogRef = this.dialogService.open(UserInfoDialog, {
      data: { user: this.user },
      header: ' ', // Empty header to respect figma design where title is inside content
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });
  }

  editUser() {
    this.dialogRef = this.dialogService.open(UserFormDialog, {
      data: { user: this.user },
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });
  }

  deleteUser() {
    this.dialogRef = this.dialogService.open(UserDeleteDialog, {
      data: { user: this.user },
      header: ' ',
      width: '400px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });
  }

  get fullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  get statusColor(): string {
    switch (this.user.status) {
      case 'accepted': return '#00AF20';
      case 'pending':  return '#F5A623';
      case 'rejected': return '#E53935';
      default:         return '#8C8C8C';
    }
  }

  get statusLabel(): string {
    return this.user.status.charAt(0).toUpperCase() + this.user.status.slice(1);
  }

  get roleLabel(): string {
    return this.user.role.charAt(0).toUpperCase() + this.user.role.slice(1);
  }
}