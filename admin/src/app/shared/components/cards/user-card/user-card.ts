import { Component } from '@angular/core';
import { Paginator, PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-user-card',
  imports: [PaginatorModule],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard {
  first: number = 0;
  rows: number = 10;

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }
}