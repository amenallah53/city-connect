import { Component } from '@angular/core';
import { UserCard } from '../../shared/components/cards/user-card/user-card';
import { Paginator, PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-users',
  imports: [UserCard, PaginatorModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  first: number = 0;
  rows: number = 10;

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }
}
