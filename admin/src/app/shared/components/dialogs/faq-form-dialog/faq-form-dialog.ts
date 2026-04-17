import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { Faq } from '../../../models/faq.model';

@Component({
  selector: 'app-faq-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './faq-form-dialog.html',
  styleUrl: './faq-form-dialog.css'
})
export class FaqFormDialog implements OnInit {
  faq: Partial<Faq> = {};
  isEditMode: boolean = false;
  
  roles = [
    { name: 'Citoyen', code: 'citoyen' },
    { name: 'Prestataire', code: 'prestataire' },
    { name: 'Global', code: 'global' }
  ];
  selectedRole: any = this.roles[0];

  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef) {}

  ngOnInit() {
    if (this.config.data?.faq) {
      this.faq = { ...this.config.data.faq };
      this.isEditMode = true;
      const r = this.roles.find(x => x.code === this.faq.role);
      if (r) this.selectedRole = r;
    }
  }

  saveForm() {
    this.faq.role = this.selectedRole.code;
    this.ref.close(this.faq);
  }
}
