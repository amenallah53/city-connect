import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '../../../shared/models/service.model';
import { ServiceCard } from "../../../shared/components/cards/service-card/service-card";
import { allServices } from 'src/app/shared/mock/services.mock';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, ServiceCard],
  templateUrl: './details-page.html',
  styleUrl: './details-page.css',
})
export class DetailsPage implements OnInit {
  service?: Service;
  relatedServices: Service[] = [];
  activeTab: string = 'Overview';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const serviceId = params['serviceId'];
      const found = allServices.find((s) => s.id === serviceId);

      if (!found) {
        this.router.navigate(['/']);
        return;
      }

      this.service = found;
      this.activeTab = 'Overview';

      let related = allServices.filter(
        (s) => s.type === found.type && s.id !== found.id
      );

      if (related.length === 0) {
        related = allServices.filter((s) => s.id !== found.id);
      }

      this.relatedServices = related.slice(0, 4);
    });
  }

  startService(): void {
    if (!this.service) return;
    this.router.navigate(['/services', this.service.id, 'request']);
  }
}