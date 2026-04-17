import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FaqCard } from '../../shared/components/cards/faq-card/faq-card';
import { FaqFormDialog } from '../../shared/components/dialogs/faq-form-dialog/faq-form-dialog';
import { Faq } from '../../shared/models/faq.model';
import { MOCK_FAQS } from '../../shared/mock/faq.mock';

interface RoleFilter { name: string; code: string; }

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule, SelectModule, FaqCard],
  providers: [DialogService],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class FaqComponent implements OnInit {
  roleFilters: RoleFilter[] = [];
  selectedRoleFilter: RoleFilter = { name: 'Filter by role', code: 'all' };

  searchQuery: string = '';

  allFaqs: Faq[] = MOCK_FAQS;
  filteredFaqs: Faq[] = [];
  pagedFaqs: Faq[] = [];

  first: number = 0;
  rows: number = 4;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.roleFilters = [
      { name: 'All Roles', code: 'all' },
      { name: 'Citoyen', code: 'citoyen' },
      { name: 'Prestataire', code: 'prestataire' }
    ];
    this.selectedRoleFilter = this.roleFilters[0];
    this.applyFilters();
  }

  onFilterChange() {
    this.first = 0;
    this.applyFilters();
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.first = 0;
      this.applyFilters();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 4;
    this.updatePagedFaqs();
  }

  callFormDialog() {
    this.dialogRef = this.dialogService.open(FaqFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'faq-dialog',
    });
  }

  private applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredFaqs = this.allFaqs.filter(faq => {
      const matchRole =
        this.selectedRoleFilter.code === 'all' ||
        faq.role === this.selectedRoleFilter.code;
      const matchSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        (faq.answer && faq.answer.toLowerCase().includes(q));
      
      return matchRole && matchSearch;
    });
    this.updatePagedFaqs();
  }

  private updatePagedFaqs() {
    this.pagedFaqs = this.filteredFaqs.slice(this.first, this.first + this.rows);
  }
}
