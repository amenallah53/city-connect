import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {

  constructor(private router: Router) {}

  links = [
    { track: 0, name: 'Home', path: '/' },
    { track: 1, name: 'Jobs', path: '/jobs' },
    { track: 2, name: 'Services', path: '/services' },
    { track: 3, name: 'FAQ', path: '/faq' },
    { track: 4, name: 'Report', path: '/report' },
  ];

  currentLink: number = 0;

  ngOnInit() {
    // set correct active link on refresh
    this.setActiveFromRoute(this.router.url);

    // update on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setActiveFromRoute(event.urlAfterRedirects);
      });
  }

  setCurrentLink(index: number) {
    this.currentLink = index;
  }

  private setActiveFromRoute(url: string) {
    const found = this.links.find(link => link.path === url);
    if (found) {
      this.currentLink = found.track;
    }
  }
}