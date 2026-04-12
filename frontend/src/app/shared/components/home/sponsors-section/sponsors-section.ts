import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sponsors-section',
  imports: [CommonModule],
  templateUrl: './sponsors-section.html',
  styleUrl: './sponsors-section.css',
  standalone: true
})
export class SponsorsSection {
  listOfSponsors = [
    {
      name: 'Sponsor 1',
      logoUrl: '/assets/sponsors/sponsor-1.jpg'
    },
    {
      name: 'Sponsor 2',
      logoUrl: '/assets/sponsors/sponsor-2.jpg'
    },
    {
      name: 'Sponsor 3',
      logoUrl: '/assets/sponsors/sponsor-3.png'
    },
    {
      name: 'Sponsor 4',
      logoUrl: '/assets/sponsors/sponsor-4.jpg'
    },
    {
      name: 'Sponsor 5',
      logoUrl: '/assets/sponsors/sponsor-5.png'
    }
  ];
  
}
