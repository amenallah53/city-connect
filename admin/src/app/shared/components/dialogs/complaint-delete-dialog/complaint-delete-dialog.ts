import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Plainte } from '../../../models/plainte.model';

@Component({
  selector: 'app-complaint-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complaint-delete-dialog.html',
  styleUrl: './complaint-delete-dialog.css'
})
export class ComplaintDeleteDialog implements OnInit {
  complaint!: Plainte;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) { }

  ngOnInit() {
    this.complaint = this.config.data?.complaint;
  }

  cancel() {
    this.ref.close(false);
  }

  confirm() {
    this.ref.close(true);
  }
}
