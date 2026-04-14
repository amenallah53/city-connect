import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '../../../shared/models/service.model';
import { ServiceCard } from "../../../shared/components/cards/service-card/service-card";
import { ServicesService } from '../../../core/services/services.service';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface ServiceDetails extends Service {
  description?: string;
  requirementsList?: string[];
}

// Service data is now fetched from the API - see ngOnInit() for details loading logic

@Component({
  selector: 'app-details-page',
  imports: [CommonModule, ServiceCard],
  templateUrl: './details-page.html',
  styleUrl: './details-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsPage implements OnInit, OnDestroy {
  serviceName: string = '';
  serviceDescription: string = '';
  serviceId: string = '';
  
  categoryBadges: string[] = [];

  requirements: string[] = [];

  relatedServices: Service[] = [];

  activeTab = signal<'requirements'>('requirements');
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to param changes and load service data whenever serviceId changes
    const serviceSub = this.route.paramMap
      .pipe(
        switchMap(paramMap => {
          const serviceId = paramMap.get('serviceId') || '';
          console.log('Loading service:', serviceId);
          this.serviceId = serviceId;
          return this.servicesService.getServiceById(serviceId);
        })
      )
      .subscribe({
        next: (serviceData) => {
          console.log('Service data received:', serviceData);
          if (serviceData) {
            this.serviceName = serviceData.name || serviceData.title || 'Service Details';
            this.serviceDescription = serviceData.description || '';
            this.categoryBadges = serviceData.badges || [];
            
            // Parse requirements if they exist
            if (serviceData.requirements) {
              if (Array.isArray(serviceData.requirements)) {
                this.requirements = serviceData.requirements;
              } else if (typeof serviceData.requirements === 'string') {
                this.requirements = serviceData.requirements.split('\n').filter(r => r.trim());
              }
            }
            
            // Trigger change detection to update template
            this.cdr.markForCheck();
            
            // Load related services AFTER main service is loaded
            const currentServiceId = parseInt(this.serviceId, 10);
            const relatedSub = this.servicesService.getAllServices().subscribe({
              next: (services) => {
                this.relatedServices = services
                  .filter(s => {
                    const sId = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
                    return sId !== currentServiceId;
                  })
                  .slice(0, 4);
                this.cdr.markForCheck();
              },
              error: (error) => {
                console.error('Error loading related services:', error);
              }
            });
            this.subscriptions.add(relatedSub);
          }
        },
        error: (error) => {
          console.error('Error loading service details:', error);
          this.serviceName = 'Service not found';
          this.serviceDescription = 'Unable to load service details.';
          this.cdr.markForCheck();
        }
      });
    this.subscriptions.add(serviceSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectTab(tab: 'requirements'): void {
    this.activeTab.set(tab);
  }

  startService(): void {
    if (this.serviceId) {
      this.router.navigate(['/services', this.serviceId, 'start']);
    }
  }
}
