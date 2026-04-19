import { Component, OnInit } from '@angular/core';
import { ServiceCard } from '../../cards/service-card/service-card';
import { RouterLink } from '@angular/router';
import { Service } from '../../../models/service.model';
import { CommonModule } from '@angular/common';
import { ServicesService } from 'src/app/core/services/services.service';
import { ServiceCardSkeleton } from '../../cards/service-card-skeleton/service-card-skeleton';

@Component({
  selector: 'app-key-services-section',
  imports: [ServiceCard, RouterLink, CommonModule, ServiceCardSkeleton],
  templateUrl: './key-services-section.html',
  styleUrl: './key-services-section.css',
  standalone: true,
})
export class KeyServicesSection implements OnInit {
  featuredServices: Service[] = [];
  isLoading: boolean = true;

  constructor(private servicesService: ServicesService) {}

  ngOnInit(): void {
    this.servicesService.getAllServices().subscribe((services) => {
      this.featuredServices = services.slice(0, 4);
      this.isLoading = false;
    });
  }
}
