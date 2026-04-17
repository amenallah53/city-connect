import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Prestataire } from '../../../models/prestataire.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PrestataireInfoDialog } from '../../dialogs/prestataire-info-dialog/prestataire-info-dialog';
import { PrestataireFormDialog } from '../../dialogs/prestataire-form-dialog/prestataire-form-dialog';
import { PrestataireDeleteDialog } from '../../dialogs/prestataire-delete-dialog/prestataire-delete-dialog';

@Component({
  selector: 'app-prestataire-card',
  providers: [DialogService],
  templateUrl: './prestataire-card.html',
  styleUrl: './prestataire-card.css',
})
export class PrestataireCard {
  @Input({ required: true }) prestataire!: Prestataire;
  @Output() statusUpdated = new EventEmitter<{ id: string; status: 'accepted' | 'rejected' }>();
  @Output() prestataireEdited = new EventEmitter<Partial<Prestataire>>();
  @Output() prestataireDeleted = new EventEmitter<string>();

  private dialogRef: DynamicDialogRef | null = null;

  constructor(private dialogService: DialogService) {}

  viewInfo() {
    this.dialogRef = this.dialogService.open(PrestataireInfoDialog, {
      data: { prestataire: this.prestataire },
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog', // keeping this primeNG custom class from user
    });

    if (!this.dialogRef) {
      return;
    }

    this.dialogRef.onClose.subscribe((result?: 'accepted' | 'rejected') => {
      if (!result) {
        return;
      }

      this.statusUpdated.emit({ id: this.prestataire.id, status: result });
    });
  }

  editPrestataire() {
    this.dialogRef = this.dialogService.open(PrestataireFormDialog, {
      data: { prestataire: this.prestataire },
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });

    if (!this.dialogRef) {
      return;
    }

    this.dialogRef.onClose.subscribe((payload?: Partial<Prestataire>) => {
      if (!payload) {
        return;
      }

      this.prestataireEdited.emit(payload);
    });
  }

  deletePrestataire() {
    this.dialogRef = this.dialogService.open(PrestataireDeleteDialog, {
      data: { prestataire: this.prestataire },
      header: ' ',
      width: '400px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });

    if (!this.dialogRef) {
      return;
    }

    this.dialogRef.onClose.subscribe((confirmed?: boolean) => {
      if (!confirmed) {
        return;
      }

      this.prestataireDeleted.emit(this.prestataire.id);
    });
  }

  get fullName(): string {
    return `${this.prestataire.firstName} ${this.prestataire.lastName}`;
  }

  get statusColor(): string {
    switch (this.prestataire.status) {
      case 'accepted': return '#00AF20';
      case 'pending':  return '#F5A623';
      case 'rejected': return '#E53935';
      default:         return '#8C8C8C';
    }
  }

  get statusLabel(): string {
    return this.prestataire.status.charAt(0).toUpperCase() + this.prestataire.status.slice(1);
  }
}
