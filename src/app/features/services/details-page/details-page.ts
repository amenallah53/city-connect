import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Service } from '../../../shared/models/service.model';
import { ServiceCard } from "../../../shared/components/cards/service-card/service-card";

interface ServiceDetails extends Service {
  description?: string;
  requirements?: string[];
}

const SERVICES_DATA: { [key: string]: ServiceDetails } = {
  '1': {
    id: '1',
    title: 'Issuing a building permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'An electronic service available on the Balady platform that enables beneficiaries to apply for a Building Permit or a Fencing Permit.',
    requirements: [
      'Updated Electronic Title Deed from the Ministry of Justice, Housing Contract, or Investment Contract.',
      'Valid Cadastral Report (for construction purposes).',
      'Contract with an Engineering Office for architectural designs.',
      'Contract with a Supervising Engineering Office and a Construction Contractor.',
      'Latent Defects Insurance for the building.',
      'Soil Study Report.',
      'Traffic Study Report (if required based on project activity).',
      'Declarations and Commitments.',
      'Payment of Service Fees.'
    ]
  },
  '2': {
    id: '2',
    title: 'Printing a burial certificate',
    type: 'Honoring the dead',
    badges: ['Electronic'],
    description: 'An electronic service for printing burial certificates.',
    requirements: ['Proof of death', 'Identification document']
  },
  '3': {
    id: '3',
    title: 'Renewing a business license',
    type: 'Business licenses',
    badges: ['With Fees', 'Not immediate'],
    description: 'Service for renewing business licenses.',
    requirements: ['Current business license', 'Business registration', 'Tax certificate']
  },
  '4': {
    id: '4',
    title: 'Issuing a building demolition permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'Service for issuing building demolition permits.',
    requirements: ['Building ownership proof', 'Structural assessment', 'Environmental clearance']
  },
  '5': {
    id: '5',
    title: 'Issuing a building permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'An electronic service available on the Balady platform that enables beneficiaries to apply for a Building Permit or a Fencing Permit.',
    requirements: [
      'Updated Electronic Title Deed from the Ministry of Justice, Housing Contract, or Investment Contract.',
      'Valid Cadastral Report (for construction purposes).',
      'Contract with an Engineering Office for architectural designs.',
      'Contract with a Supervising Engineering Office and a Construction Contractor.',
      'Latent Defects Insurance for the building.',
      'Soil Study Report.',
      'Traffic Study Report (if required based on project activity).',
      'Declarations and Commitments.',
      'Payment of Service Fees.'
    ]
  }
};

@Component({
  selector: 'app-details-page',
  imports: [CommonModule, ServiceCard],
  templateUrl: './details-page.html',
  styleUrl: './details-page.css',
})
export class DetailsPage implements OnInit {
  serviceName: string = 'Issuing a Building Permit';
  serviceDescription: string = 'An electronic service available on the Balady platform that enables beneficiaries to apply for a Building Permit or a Fencing Permit.';
  
  categoryBadges: string[] = [
    'Construction licenses',
    'Construction Permit',
    'Issue Building Permit',
    'Structural Permit',
    'Renovation Permit',
    'Expansion Permit',
    'Building License',
    'New Building Permit'
  ];

  requirements: string[] = [
    'Updated Electronic Title Deed from the Ministry of Justice, Housing Contract, or Investment Contract.',
    'Valid Cadastral Report (for construction purposes).',
    'Contract with an Engineering Office for architectural designs.',
    'Contract with a Supervising Engineering Office and a Construction Contractor.',
    'Latent Defects Insurance for the building.',
    'Soil Study Report.',
    'Traffic Study Report (if required based on project activity).',
    'Declarations and Commitments.',
    'Payment of Service Fees.'
  ];

  relatedServices: Service[] = [
    {
      id: '1',
      title: 'Issuing a building permit',
      type: 'Building permits',
      badges: ['Electronic', 'Not immediate']
    },
    {
      id: '2',
      title: 'Printing a burial certificate',
      type: 'Honoring the dead',
      badges: ['Electronic']
    },
    {
      id: '3',
      title: 'Renewing a business license',
      type: 'Business licenses',
      badges: ['With Fees', 'Not immediate']
    },
    {
      id: '4',
      title: 'Issuing a building demolition permit',
      type: 'Building permits',
      badges: ['Electronic', 'Not immediate']
    }
  ];

  activeTab = signal<'requirements' | 'fines' | 'faq'>('requirements');

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const serviceId = params['serviceId'];
      const serviceData = SERVICES_DATA[serviceId];
      
      if (serviceData) {
        this.serviceName = serviceData.title;
        this.serviceDescription = serviceData.description || '';
        this.requirements = serviceData.requirements || [];
        this.categoryBadges = serviceData.badges;
      }
    });
  }

  selectTab(tab: 'requirements' | 'fines' | 'faq'): void {
    this.activeTab.set(tab);
  }
}
