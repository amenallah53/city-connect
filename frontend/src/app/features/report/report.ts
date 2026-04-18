import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { Ticket } from '../../shared/models/ticket.model';
import { CITIES, TICKET_CATEGORIES } from '../../core/constants/app.constants';

interface ReportFormData {
  location: string;
  category: string;
  title: string;
  description: string;
  agreed: boolean;
}

@Component({
  selector: 'app-report',
  imports: [FormsModule, CommonModule],
  templateUrl: './report.html',
  styleUrl: './report.css',
})

export class Report {
  constructor(
    private ticketService: TicketService,
    private router: Router
  ) { }
  cities = CITIES;
  categories = TICKET_CATEGORIES;

  formData: ReportFormData = {
    location: '',
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

  ngOnInit(): void {
    this.ticketService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.map(c => c.type);
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
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

  onSubmit(form: NgForm): void {
    if (form.invalid || this.fileError) {
      form.form.markAllAsTouched();
      return;
    }

    const ticket: Ticket = {
      title: this.formData.title,
      description: this.formData.description,
      location: this.formData.location,
      category: this.formData.category,
      status: 'pending'
    };

    console.log('Submitting ticket:', ticket);

    // Pass the selected file to the service for upload
    this.ticketService.createTicket(ticket, this.selectedFile || undefined).subscribe({
      next: (res) => {
        console.log('Ticket created successfully:', res);
        form.resetForm();
        this.resetFile();
        this.router.navigate(['/all-my-reports']);
      },
      error: (err) => {
        console.error('Error creating ticket:', err);
      }
    });
  }
}