import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HoraireService } from '../../../models/horaire-service.model';

@Component({
  selector: 'app-service-schedule-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-schedule-form-dialog.html',
  styleUrl: './service-schedule-form-dialog.css',
})
export class ServiceScheduleFormDialog implements OnInit {
  isEditMode = false;

  formData: Partial<HoraireService> = {
    name: '',
    type: '',
    heureDeb: '07:30 AM',
    heureFin: '05:00 PM',
    days: []
  };

  allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    if (this.config.data?.schedule) {
      this.isEditMode = true;
      this.formData = { ...this.config.data.schedule };
    }
  }

  toggleDay(day: string) {
    if (!this.formData.days) this.formData.days = [];
    if (this.formData.days.includes(day)) {
      this.formData.days = this.formData.days.filter(d => d !== day);
    } else {
      this.formData.days.push(day);
    }
  }

  isDaySelected(day: string): boolean {
    return this.formData.days?.includes(day) || false;
  }

  save() {
    this.ref.close(this.formData);
  }
}
