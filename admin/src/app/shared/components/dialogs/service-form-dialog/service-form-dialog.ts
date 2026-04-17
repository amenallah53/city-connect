import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'app-service-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-form-dialog.html',
  styleUrl: './service-form-dialog.css'
})
export class ServiceFormDialog implements OnInit {
  service: Partial<Service> = { badges: [], requirements: [] };
  
  newBadge: string = '';
  requirementText: string = '';

  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef) {}

  ngOnInit() {
    if (this.config.data?.service) {
      this.service = JSON.parse(JSON.stringify(this.config.data.service));
      this.requirementText = this.service.requirements?.join('\n') || '';
    }
  }

  addBadge() {
    if (this.newBadge.trim()) {
      if (!this.service.badges) this.service.badges = [];
      this.service.badges.push(this.newBadge.trim());
      this.newBadge = '';
    }
  }

  removeBadge(index: number) {
    this.service.badges?.splice(index, 1);
  }

  saveForm() {
    this.service.requirements = this.requirementText.split('\n').filter(r => r.trim() !== '');
    this.ref.close(this.service);
  }
}
