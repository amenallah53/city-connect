import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HoraireService } from '../../../shared/models/horaire-service.model';
import { allHoraires } from '../../../shared/mock/horaires.mock';

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-page.html',
  styleUrl: './schedule-page.css',
})

export class SchedulePage {
  readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  activeFilter = 'All';

  get filters(): string[] {
    return ['All', ...new Set(allHoraires.map((h) => h.type ?? 'Other'))];
  }

  get filtered(): HoraireService[] {
    if (this.activeFilter === 'All') return allHoraires;
    return allHoraires.filter((h) => h.type === this.activeFilter);
  }

  constructor(private router: Router) {}

  setFilter(f: string): void {
    this.activeFilter = f;
  }

  hasDay(h: HoraireService, day: string): boolean {
    return h.days?.includes(day) ?? false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}