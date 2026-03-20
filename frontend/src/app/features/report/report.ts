import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface ReportFormData {
  city: string;
  category: string;
  title: string;
  description: string;
  agreed: boolean;
}

@Component({
  selector: 'app-report',
  imports: [FormsModule,CommonModule],
  templateUrl: './report.html',
  styleUrl: './report.css',
})

export class Report {

  cities: string[] = [
    'Ariana',
    'Beja',
    'Ben Arous',
    'Bizerte',
    'Gabes',
    'Gafsa',
    'Jendouba',
    'Kairouan',
    'Kasserine',
    'Kebili',
    'Kef',
    'Mahdia',
    'Manouba',
    'Medenine',
    'Monastir',
    'Nabeul',
    'Sfax',
    'Sidi Bouzid',
    'Siliana',
    'Sousse',
    'Tataouine',
    'Tozeur',
    'Tunis',
    'Zaghouan',
  ];

  categories: string[] = [
    'Street lighting',
    'Traffic lights',
    'Potholes',
    'Sanitation',
    'Public transport',
    'Other',
  ];

  formData: ReportFormData = {
    city: '',
    category: '',
    title: '',
    description: '',
    agreed: false,
  };

  // File state
  fileName: string = '';
  imagePreview: string | null = null;
  fileError: string = '';
  selectedFile: File | null = null;

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

  onSubmit(form: NgForm): void {
    if (form.invalid || this.fileError) {
      form.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.formData,
      file: this.selectedFile,
    };

    console.log('Form submitted:', payload);
    // TODO: inject your service and call e.g. this.reportService.submit(payload)

    form.resetForm();
    this.resetFile();
  }
}