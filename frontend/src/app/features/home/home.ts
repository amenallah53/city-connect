import { Component, AfterViewInit, QueryList, ViewChildren, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroSection } from '../../shared/components/home/hero-section/hero-section';
import { KeyServicesSection } from '../../shared/components/home/key-services-section/key-services-section';
import { AboutUs } from '../../shared/components/home/about-us/about-us';
import { NewsSection } from '../../shared/components/home/news-section/news-section';
import { SponsorsSection } from '../../shared/components/home/sponsors-section/sponsors-section';
import { ServicesSchedulesSection } from '../../shared/components/home/services-schedules-section/services-schedules-section';
import { ComplaintSection } from '../../shared/components/home/complaint-section/complaint-section';
import { animate, inView } from 'motion';

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
export class Home implements AfterViewInit {

  @ViewChildren('section') sections!: QueryList<ElementRef>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    // ✅ Only run in the browser, not during SSR/Node
    if (!isPlatformBrowser(this.platformId)) return;

    this.sections.forEach((section) => {
      const el = section.nativeElement;

      el.style.opacity = '0';
      el.style.transform = 'translateY(50px)';

      inView(el, () => {
        animate(
          el,
          {
            opacity: [0, 1],
            transform: ['translateY(50px)', 'translateY(0px)']
          },
          {
            duration: 0.7,
            delay: 0.1,
            ease: [0.17, 0.55, 0.55, 1]
          }
        );
      }, { margin: '-80px' });
    });
  }
}