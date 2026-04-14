import { Component } from '@angular/core';
import { ServiceCard } from '../../cards/service-card/service-card';
import { RouterLink } from '@angular/router';
import { Service } from '../../../models/service.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-key-services-section',
  imports: [ServiceCard, RouterLink, CommonModule],
  templateUrl: './key-services-section.html',
  styleUrl: './key-services-section.css',
  standalone: true,
})
export class KeyServicesSection {
  featuredServices: Service[] = [
    {
      id: 'building-permit',
      name: 'Building Permit',
      type: 'Urban Planning',
      badges: ['Online', 'Not immediate'],
      featured: true
    },
    {
      id: 'garbage-collection',
      name: 'Garbage Collection',
      type: 'Sanitation',
      badges: ['Scheduled', 'Public Service'],
      featured: true
    },
    {
      id: 'complaint',
      name: 'Complaint Submission',
      type: 'Citizen Service',
      badges: ['Online', 'Immediate'],
      featured: true
    },
    {
      id: 'birth-certificate',
      name: 'Birth Certificate',
      type: 'Civil Status',
      badges: ['Online', 'Official'],
      featured: true
    }
  ];
}
