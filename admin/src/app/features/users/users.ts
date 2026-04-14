import { Component } from '@angular/core';
import { Complaints } from "../complaints/complaints";
import { UserCard } from '../../shared/components/cards/user-card/user-card';

@Component({
  selector: 'app-users',
  imports: [Complaints, UserCard],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {

}
