import { Component } from '@angular/core';
import { HeroSection } from '../../shared/components/home/hero-section/hero-section';
import { KeyServicesSection } from '../../shared/components/home/key-services-section/key-services-section';
import { AboutUs } from '../../shared/components/home/about-us/about-us';
import { NewsSection } from '../../shared/components/home/news-section/news-section';
import { SponsorsSection } from '../../shared/components/home/sponsors-section/sponsors-section';
import { ServicesSchedulesSection } from '../../shared/components/home/services-schedules-section/services-schedules-section';
import { ComplaintSection } from '../../shared/components/home/complaint-section/complaint-section';


@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [
    HeroSection, 
    KeyServicesSection, 
    AboutUs, 
    NewsSection, 
    SponsorsSection, 
    ServicesSchedulesSection,
    ComplaintSection
  ],
  standalone: true
})
export class Home {

}
