import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Prestataire } from '../../../shared/models/prestataire.model';
import { allJobs } from '../../../shared/mock/jobs.mock';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule],
  templateUrl: './details-page.html',
  styleUrl: './details-page.css',
})
export class DetailsPage implements OnInit {
  job!: Prestataire;

  selectedDate?: Date = new Date();
  requestSent = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const jobID = params['jobsId'];
      const found = allJobs.find((j) => j.id === jobID);

      if (!found) {
        this.router.navigate(['/']);
        return;
      }

      this.job = found;
    });
  }

  sendRequest() {
    if (!this.selectedDate) return;

    // simulate API call
    this.requestSent = true;

    setTimeout(() => {
      this.requestSent = false;
    }, 3000);
  }
}