import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from '../../../models/user.model';
import { UsersServices } from '../../../../core/services/users-services';

@Component({
  selector: 'app-user-delete-dialog',
  imports: [CommonModule],
  templateUrl: './user-delete-dialog.html',
  styleUrl: './user-delete-dialog.css'
})
export class UserDeleteDialog implements OnInit {
  user!: User;
  private usersService = inject(UsersServices);

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    this.user = this.config.data?.user;
  }

  confirm() {
    this.usersService.delete(this.user.id).subscribe({
      next: () => this.ref.close(true),
      error: () => this.ref.close(false)
    });
  }

  cancel() {
    this.ref.close(false);
  }
}
