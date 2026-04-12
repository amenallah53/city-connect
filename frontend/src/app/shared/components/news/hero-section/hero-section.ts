import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [GalleriaModule],
  templateUrl: './hero-section.html',
  styleUrls: ['./hero-section.css'],
})
export class HeroSection implements OnChanges {
  @Input() heroTitle!: string;
  @Input() heroSubtitle!: string;
  @Input() heroImg!: string;

  images: any[] = [];

  responsiveOptions: any[] = [
    { breakpoint: '991px', numVisible: 4 },
    { breakpoint: '767px', numVisible: 3 },
    { breakpoint: '575px', numVisible: 1 }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['heroImg'] && this.heroImg) {
      this.images = [
        { itemImageSrc: this.heroImg, alt: this.heroTitle }
      ];
    }
  }
}