import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-report-card',
  imports: [],
  templateUrl: './report-card.html',
  styleUrl: './report-card.css',
})
export class ReportCard {
  @Input() status:  'approved' | 'pending' | 'rejected' | 'ongoing' = 'pending';
}
