import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { User } from '../../../models/user.model';
import { Prestataire } from '../../../models/prestataire.model';

@Component({
  selector: 'app-user-info-dialog',
  imports: [CommonModule],
  templateUrl: './user-info-dialog.html',
  styleUrl: './user-info-dialog.css'
})
export class UserInfoDialog implements OnInit {
  user!: User | Prestataire;

  constructor(public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.user = this.config.data?.user;
  }

  isPrestataire(): boolean {
    return this.user?.role === 'prestataire';
  }

  get prestataireInfo(): Prestataire | null {
    return this.isPrestataire() ? (this.user as Prestataire) : null;
  }

  approve() {
    this.config.data.user.status = 'accepted';
    // In a real app, you would dispatch an action or call a service
  }

  reject() {
    this.config.data.user.status = 'rejected';
    // In a real app, you would dispatch an action or call a service
  }
}
