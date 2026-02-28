import { Component } from '@angular/core';
import { HeroSection } from '../../shared/components/home/hero-section/hero-section';
import { KeyServicesSection } from '../../shared/components/home/key-services-section/key-services-section';


@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [HeroSection, KeyServicesSection],
  standalone: true
})
export class Home {

}
