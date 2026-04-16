import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Prestataire } from '../../../models/prestataire.model';

@Component({
  selector: 'app-prestataire-delete-dialog',
  imports: [CommonModule],
  templateUrl: './prestataire-delete-dialog.html',
  styleUrl: './prestataire-delete-dialog.css'
})
export class PrestataireDeleteDialog implements OnInit {
  prestataire!: Prestataire;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) { }

  ngOnInit() {
    this.prestataire = this.config.data?.prestataire;
  }

  confirm() {
    this.ref.close(true);
  }

  cancel() {
    this.ref.close(false);
  }
}
