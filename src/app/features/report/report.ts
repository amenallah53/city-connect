import { Component, Input, input } from '@angular/core';
import { ReportCard } from "../../shared/components/report/report-card/report-card";

@Component({
  selector: 'app-report',
  imports: [ReportCard],
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class Report {
}
