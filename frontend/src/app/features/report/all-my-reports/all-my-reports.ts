import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ReportCard } from '../../../shared/components/cards/report-card/report-card';

type ReportStatus = 'pending' | 'approved' | 'rejected';

interface Report {
  id: string;
  title: string;
  category: string;
  city: string;
  status: ReportStatus;
  date: string;
}

const mockReports: Report[] = [
  { id: '1',  title: 'Broken streetlight',       category: 'Street lighting',  city: 'Tunis',    status: 'pending',  date: '2025-03-01' },
  { id: '2',  title: 'Pothole on main road',      category: 'Potholes',         city: 'Sousse',   status: 'approved', date: '2025-03-05' },
  { id: '3',  title: 'Overflowing garbage bin',   category: 'Sanitation',       city: 'Sfax',     status: 'rejected', date: '2025-03-07' },
  { id: '4',  title: 'Faulty traffic light',      category: 'Traffic lights',   city: 'Ariana',   status: 'pending',  date: '2025-03-10' },
  { id: '5',  title: 'Bus stop damaged',          category: 'Public transport', city: 'Bizerte',  status: 'approved', date: '2025-03-12' },
  { id: '6',  title: 'Graffiti on public wall',   category: 'Other',            city: 'Nabeul',   status: 'rejected', date: '2025-03-14' },
  { id: '7',  title: 'Water leak on street',      category: 'Sanitation',       city: 'Monastir', status: 'pending',  date: '2025-03-15' },
  { id: '8',  title: 'Broken park bench',         category: 'Other',            city: 'Tunis',    status: 'approved', date: '2025-03-17' },
  { id: '9',  title: 'Missing road sign',         category: 'Traffic lights',   city: 'Gafsa',    status: 'pending',  date: '2025-03-18' },
  { id: '10', title: 'Damaged sidewalk',          category: 'Potholes',         city: 'Mahdia',   status: 'rejected', date: '2025-03-19' },
  { id: '11', title: 'Illegal dumping',           category: 'Sanitation',       city: 'Kairouan', status: 'approved', date: '2025-03-20' },
  { id: '12', title: 'Flooded underpass',         category: 'Other',            city: 'Sfax',     status: 'pending',  date: '2025-03-21' },
  { id: '13', title: 'Street light flickering',   category: 'Street lighting',  city: 'Tunis',    status: 'approved', date: '2025-03-22' },
  { id: '14', title: 'Cracked road surface',      category: 'Potholes',         city: 'Sousse',   status: 'pending',  date: '2025-03-23' },
];

@Component({
  selector: 'app-all-my-reports',
  standalone: true,
  imports: [CommonModule, ReportCard, PaginatorModule, RouterLink],
  templateUrl: './all-my-reports.html',
  styleUrl: './all-my-reports.css',
})
export class AllMyReports {
  allReports: Report[] = mockReports;

  first = 0;
  rows = 9;

  get pagedReports(): Report[] {
    return this.allReports.slice(this.first, this.first + this.rows);
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 9;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}