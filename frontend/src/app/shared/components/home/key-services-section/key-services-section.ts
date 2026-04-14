import { Component } from '@angular/core';
import { ServiceCard } from '../../cards/service-card/service-card';
import { RouterLink } from '@angular/router';
import { Service } from '../../../models/service.model';
import { CommonModule } from '@angular/common';
import { allServices } from 'src/app/shared/mock/services.mock';

@Component({
  selector: 'app-key-services-section',
  imports: [ServiceCard, RouterLink, CommonModule],
  templateUrl: './key-services-section.html',
  styleUrl: './key-services-section.css',
  standalone: true,
})
export class KeyServicesSection {
  featuredServices: Service[] = allServices.slice(0,4);
}
