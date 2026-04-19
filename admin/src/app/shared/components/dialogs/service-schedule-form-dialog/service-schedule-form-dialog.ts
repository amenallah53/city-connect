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
    heureDeb: '07:30',
    heureFin: '17:00',
    days: []
  };

  allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  shortDays: { [key: string]: string } = {
    'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday',
    'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday',
    'Monday': 'Monday', 'Tuesday': 'Tuesday', 'Wednesday': 'Wednesday',
    'Thursday': 'Thursday', 'Friday': 'Friday', 'Saturday': 'Saturday', 'Sunday': 'Sunday'
  };

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    if (this.config.data?.schedule) {
      this.isEditMode = true;
      const schedule = this.config.data.schedule;
      // Map short names to long names if necessary
      this.formData = { 
        ...schedule,
        days: schedule.days?.map((d: string) => this.shortDays[d] || d) || []
      };
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
