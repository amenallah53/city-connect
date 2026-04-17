import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Plainte } from '../../../models/plainte.model';

@Component({
  selector: 'app-complaint-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaint-form-dialog.html',
  styleUrl: './complaint-form-dialog.css'
})
export class ComplaintFormDialog implements OnInit {
  complaint: Partial<Plainte> = {
    status: 'pending',
    dateCreation: new Date()
  };
  categoryIdString: string = '';

  fileName: string = '';
  imagePreview: string | null = null;
  fileError: string = '';
  selectedFile: File | null = null;

  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef) {}

  ngOnInit() {
    if (this.config.data?.complaint) {
      this.complaint = JSON.parse(JSON.stringify(this.config.data.complaint));
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = '';

    if (!input.files || input.files.length === 0) {
      this.resetFile();
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.fileError = 'Only image files are allowed.';
      this.resetFile();
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      this.fileError = 'File size must be less than 1MB.';
      this.resetFile();
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private resetFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.imagePreview = null;
  }

  saveForm() {
    if (this.categoryIdString) {
      this.complaint.categorieId = parseInt(this.categoryIdString, 10) || undefined;
    }
    this.ref.close({
      complaint: this.complaint,
      file: this.selectedFile
    });
  }
}
