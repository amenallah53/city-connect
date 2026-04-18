import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, UserProfile } from '../../core/services/profile.service';
import { TicketService } from '../../core/services/ticket.service';
import { ServiceRequestsService } from '../../core/services/service-requests.service';
import { UserAuthService } from '../../core/services/auth.service';
import { LucideAngularModule, User as UserIcon, Mail, CreditCard, Lock, Edit2 } from 'lucide-angular';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  userProfile: UserProfile | null = null;
  stats = {
    reports: 0,
    demand: 0,
    resolved: 0,
    approved: 0
  };
  isLoading = true;

  // Icons
  UserIcon = UserIcon;
  MailIcon = Mail;
  CinIcon = CreditCard;
  LockIcon = Lock;
  EditIcon = Edit2;

  constructor(
    private profileService: ProfileService,
    private ticketService: TicketService,
    private serviceRequestsService: ServiceRequestsService,
    private authService: UserAuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    const userData = this.authService.getCurrentUser();
    
    if (!userData) {
      this.isLoading = false;
      return;
    }

    const cin = userData.cin;

    forkJoin({
      profile: this.profileService.getProfile(),
      tickets: this.ticketService.getAllTickets({ limit: 1 }),
      resolvedTickets: this.ticketService.getAllTickets({ status: 'accepted', limit: 1 }),
      serviceRequests: this.serviceRequestsService.getUserServiceRequests(cin)
    }).subscribe({
      next: (res) => {
        this.userProfile = res.profile;
        this.stats.reports = res.tickets.total;
        this.stats.resolved = res.resolvedTickets.total;
        this.stats.demand = res.serviceRequests.length;
        this.stats.approved = res.serviceRequests.filter(req => req.status === 'approved' || req.status === 'approuvee').length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile data:', err);
        this.isLoading = false;
      }
    });
  }

  getInitials(): string {
    if (!this.userProfile) return 'U';
    const first = this.userProfile.firstname?.charAt(0) || '';
    const last = this.userProfile.lastname?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }
}
