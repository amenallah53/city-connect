import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Prestataire } from '../../../models/prestataire.model';

@Component({
  selector: 'app-prestataire-info-dialog',
  imports: [CommonModule],
  templateUrl: './prestataire-info-dialog.html',
  styleUrl: './prestataire-info-dialog.css'
})
export class PrestataireInfoDialog implements OnInit {
  prestataire!: Prestataire;

  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef) { }

  ngOnInit() {
    this.prestataire = this.config.data?.prestataire;
  }

  approve() {
    this.ref.close('accepted');
  }

  reject() {
    this.ref.close('rejected');
  }
}
