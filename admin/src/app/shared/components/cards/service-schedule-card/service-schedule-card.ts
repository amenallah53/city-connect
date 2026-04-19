import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoraireService } from '../../../models/horaire-service.model';

@Component({
  selector: 'app-service-schedule-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-schedule-card.html',
  styleUrl: './service-schedule-card.css',
})
export class ServiceScheduleCard {
  @Input() schedule!: HoraireService;
  @Output() edit = new EventEmitter<HoraireService>();
  @Output() delete = new EventEmitter<string>();

  allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  shortDaysMap: { [key: string]: string } = {
    'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed',
    'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
  };

  isDayActive(day: string): boolean {
    const fullDay = this.shortDaysMap[day] || day;
    // Check both full name and short name for compatibility
    return this.schedule.days?.some(d => d === day || d === fullDay) || false;
  }

  onEdit() {
    this.edit.emit(this.schedule);
  }

  onDelete() {
    if (this.schedule.id) {
      this.delete.emit(this.schedule.id);
    }
  }
}
