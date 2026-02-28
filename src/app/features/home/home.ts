import { Component } from '@angular/core';
import { HeroSection } from '../../shared/components/home/hero-section/hero-section';
import { KeyServicesSection } from '../../shared/components/home/key-services-section/key-services-section';
import { AboutUs } from '../../shared/components/home/about-us/about-us';


@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [HeroSection, KeyServicesSection, AboutUs],
  standalone: true
})
export class Home {

}
