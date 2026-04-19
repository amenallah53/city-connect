import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FaqCard } from '../../shared/components/cards/faq-card/faq-card';
import { FaqFormDialog } from '../../shared/components/dialogs/faq-form-dialog/faq-form-dialog';
import { Faq } from '../../shared/models/faq.model';
import { FaqServices } from '../../core/services/faq-services';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [FormsModule, Paginator, SelectModule, FaqCard],
  providers: [DialogService],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class FaqComponent implements OnInit {

  private dialogService = inject(DialogService);
  private faqService = inject(FaqServices);

  searchQuery = signal('');
  allFaqs = signal<Faq[]>([]);
  first = signal(0);
  rows = signal(4);
  loading = signal(false);
  error = signal<string | null>(null);

  filteredFaqs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return !q
      ? this.allFaqs()
      : this.allFaqs().filter(faq => faq.question.toLowerCase().includes(q));
  });

  pagedFaqs = computed(() =>
    this.filteredFaqs().slice(this.first(), this.first() + this.rows())
  );

  private dialogRef: DynamicDialogRef | null = null;

  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.loading.set(true);
    this.error.set(null);
    this.faqService.getUnanswered().subscribe({
      next: (data) => {
        this.allFaqs.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load FAQs');
        this.loading.set(false);
      }
    });
  }

  onSearchInput(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.first.set(0);
  }

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 4);
  }

  callFormDialog() {
    this.dialogRef = this.dialogService.open(FaqFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'faq-dialog',
    });
    this.dialogRef!.onClose.subscribe(() => this.loadFaqs());
  }
}