import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Prestataire } from '../../../models/prestataire.model';

@Component({
  selector: 'app-prestataire-form-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './prestataire-form-dialog.html',
  styleUrl: './prestataire-form-dialog.css'
})
export class PrestataireFormDialog implements OnInit {
  isEditMode = false;

  formData: Partial<Prestataire> = {
    firstName: '',
    lastName: '',
    email: '',
    cin: '',
    telephone: '',
    addresse: '',
    specialty: '',
    description: '',
    document: '',
    role: 'prestataire',
    status: 'pending',
    reach: 'on-demand'
  };

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) { }

  ngOnInit() {
    if (this.config.data?.prestataire) {
      this.isEditMode = true;
      this.formData = { ...this.config.data.prestataire };
    }
  }

  save() {
    this.ref.close(this.formData);
  }
}
