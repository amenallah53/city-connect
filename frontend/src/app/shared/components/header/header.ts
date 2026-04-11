import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserAuthService } from '../../../core/services/auth.service'; // adjust path
import { ConfirmationService, MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, CommonModule, MenuModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  links = [
    { track: 0, name: 'Home', path: '/' },
    { track: 1, name: 'Jobs', path: '/jobs' },
    { track: 2, name: 'Services', path: '/services' },
    { track: 3, name: 'FAQ', path: '/faq' },
    { track: 4, name: 'Report', path: '/report' },
  ];

  currentLink: number = 0;
  showProfileMenu: boolean = false;

  profileMenuItems: MenuItem[] = [];

  constructor(
    private router: Router, 
    private auth: UserAuthService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.setActiveFromRoute(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setActiveFromRoute(event.urlAfterRedirects);
      });

    this.profileMenuItems = [
      {
        label: 'Profile',
        command: () => this.router.navigate(['/profile'])
      },
      {
        label: 'Logout',
        command: () => this.confirmLogout()
      }
    ];
  }

  confirmLogout() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to logout?',
      header: 'Logout',
      icon: 'pi pi-sign-out',
      acceptLabel: 'Logout',
      rejectLabel: 'Cancel',
      accept: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  setCurrentLink(index: number) {
    this.currentLink = index;
  }

  private setActiveFromRoute(url: string) {
    const found = this.links.find(link => link.path === url);
    if (found) {
      this.currentLink = found.track;
    } else {
      this.currentLink = -1; // No link active
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu() {
    this.showProfileMenu = false;
  }

  logout() {
    this.auth.logout(); // remove token and simulate logout
    this.router.navigate(['/login']);
  }
}