import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HoraireService } from '../../../shared/models/horaire-service.model';
import { SchedulesService } from '../../../core/services/schedules.service';

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-page.html',
  styleUrl: './schedule-page.css',
})

export class SchedulePage implements OnInit {
  readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  activeFilter = 'All';
  allHoraires: HoraireService[] = [];

  get filters(): string[] {
    return ['All', ...new Set(this.allHoraires.map((h) => h.type ?? 'Other'))];
  }

  get filtered(): HoraireService[] {
    if (this.activeFilter === 'All') return this.allHoraires;
    return this.allHoraires.filter((h) => h.type === this.activeFilter);
  }

  constructor(
    private router: Router,
    private schedulesService: SchedulesService
  ) {}

  ngOnInit(): void {
    this.schedulesService.getSchedules().subscribe({
      next: (data) => {
        this.allHoraires = data;
      },
      error: (err) => console.error('Failed to load schedules', err)
    });
  }

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