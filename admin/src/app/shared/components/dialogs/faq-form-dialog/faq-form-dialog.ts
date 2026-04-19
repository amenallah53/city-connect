import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { Faq } from '../../../models/faq.model';
import { FaqServices } from '../../../../core/services/faq-services';

@Component({
  selector: 'app-faq-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './faq-form-dialog.html',
  styleUrl: './faq-form-dialog.css'
})
export class FaqFormDialog implements OnInit {

  config = inject(DynamicDialogConfig);
  ref = inject(DynamicDialogRef);
  private faqService = inject(FaqServices);

  faq = signal<Partial<Faq>>({ question: '', answer: null });
  isEditMode = signal(false);
  error = signal<string | null>(null);
  loading = signal(false);

  ngOnInit() {
    if (this.config.data?.faq) {
      this.faq.set({ ...this.config.data.faq });
      this.isEditMode.set(true);
    }
  }

  setQuestion(value: string) {
    this.faq.update(f => ({ ...f, question: value }));
  }

  setAnswer(value: string) {
    this.faq.update(f => ({ ...f, answer: value }));
  }

  saveForm() {
    this.error.set(null);
    const current = this.faq();

    if (this.isEditMode()) {
      if (!current.answer?.trim()) {
        this.error.set('Answer is required');
        return;
      }
      this.loading.set(true);
      this.faqService.answer(current.id!, current.answer!).subscribe({
        next: () => { this.loading.set(false); this.ref.close(true); },
        error: () => { this.error.set('Failed to save answer'); this.loading.set(false); }
      });
    } else {
      if (!current.question?.trim()) {
        this.error.set('Question is required');
        return;
      }
      this.loading.set(true);
      this.faqService.ask(current.question!, current.answer || null).subscribe({
        next: () => { this.loading.set(false); this.ref.close(true); },
        error: () => { this.error.set('Failed to submit question'); this.loading.set(false); }
      });
    }
  }
}