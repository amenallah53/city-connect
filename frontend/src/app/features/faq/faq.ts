import { Faqq } from '../../shared/models/faq.model';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FaqService } from './faq-service/faq-service';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq implements OnInit {

  private faqService = inject(FaqService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  faqs: Faqq[] = [];
  filteredFaqs: Faqq[] = [];
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  questionForm = this.fb.group({
    question: ['', Validators.required]
  });

  ngOnInit() {
    this.faqService.getAnsweredFaqs().subscribe({
      next: (data) => {
        this.faqs = data;
        this.filteredFaqs = data;
        this.cdr.detectChanges(); 
      },
      error: () => {
        this.errorMessage = 'Failed to load FAQs';
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredFaqs = this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  }

  onSubmit() {  
    this.successMessage = null;
    this.errorMessage = null;
    if (this.questionForm.invalid || !this.questionForm.value.question?.trim()) {
      this.successMessage = null;
      this.errorMessage = 'Question is required';
      this.cdr.detectChanges();
      return;
    }
    this.isLoading = true;
    this.faqService.askQuestion(this.questionForm.value.question!).subscribe({
      next: () => {
        this.isLoading = false;
        this.errorMessage = null;
        this.successMessage = 'Your question has been sent successfully!';
        this.questionForm.reset();
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.isLoading = false;
        this.successMessage = null;
        this.errorMessage = err.error?.error || err.message;
        this.cdr.detectChanges();
      }
    });
  }
}