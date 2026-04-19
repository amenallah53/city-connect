import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Prestataire } from '../../../shared/models/prestataire.model';
// import { allJobs } from '../../../shared/mock/jobs.mock';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserAuthService } from '../../../core/services/auth.service';

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
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: UserAuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const jobID = params['jobsId'];
      if (!jobID) {
        this.router.navigate(['/jobs']);
        return;
      }

      this.isLoading = true;
      this.http.get<any>(`${environment.prestatairesUrl}/${jobID}`).subscribe({
        next: (res) => {
          this.job = this.mapApiPrestataire(res.data);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load job details:', err);
          this.router.navigate(['/jobs']);
          this.cdr.markForCheck();
        }
      });
    });
  }

  private mapApiPrestataire(item: any): Prestataire {
    return {
      id: item.id,
      cin: item.cin,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      addresse: item.addresse,
      telephone: item.telephone,
      status: item.status,
      role: item.role,
      document: item.document,
      documentType: item.documentType,
      createdAt: new Date(item.createdAt),
      specialty: item.specialty,
      rating: item.rating,
      description: item.description,
      reach: item.reach,
      socialLinks: item.socialLinks,
      submissionDate: new Date(item.submissionDate),
    };
  }

  sendRequest() {
    if (!this.selectedDate || !this.job) return;

    // ✅ getCurrentLoggedUser() returns Observable<User|null>, must subscribe
    this.auth.getCurrentLoggedUser().subscribe({
      next: (user) => {
        if (!user) {
          alert('Please login to request an offer');
          return;
        }

        const payload = {
          prestataireId: this.job.id,
          offerorId: user.id,
          dateJobSuggestion: this.selectedDate,
          status: 'pending'
        };

        console.log('Sending payload:', payload);

        this.requestSent = true;
        this.http.post(environment.offersUrl, payload).subscribe({
          next: () => {
            alert('Request sent successfully!');
            setTimeout(() => { this.requestSent = false; }, 3000);
          },
          error: (err) => {
            console.error('Failed to send request:', err);
            alert('Failed to send request. Please try again later.');
            this.requestSent = false;
          }
        });
      },
      error: () => {
        alert('Could not verify your session. Please login again.');
      }
    });
  }
}