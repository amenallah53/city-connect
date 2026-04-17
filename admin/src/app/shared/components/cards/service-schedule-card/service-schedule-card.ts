import { Component, Input } from '@angular/core';
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

  allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  isDayActive(day: string): boolean {
    return this.schedule.days?.includes(day) || false;
  }
}
