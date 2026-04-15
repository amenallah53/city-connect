import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-delete-dialog',
  imports: [CommonModule],
  templateUrl: './user-delete-dialog.html',
  styleUrl: './user-delete-dialog.css'
})
export class UserDeleteDialog implements OnInit {
  user!: User;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) { }

  ngOnInit() {
    this.user = this.config.data?.user;
  }

  confirm() {
    // Return true / user id to parent component to proceed with delete
    this.ref.close(true);
  }

  cancel() {
    this.ref.close(false);
  }
}
