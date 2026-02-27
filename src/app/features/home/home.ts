import { Component } from '@angular/core';
import { HeroSection } from '../../shared/components/home/hero-section/hero-section';


@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [HeroSection],
  standalone: true
})
export class Home {

}
