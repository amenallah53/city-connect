import { Component, Input } from '@angular/core';
import { Service } from '../../../models/service.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-card',
  imports: [CommonModule,RouterLink],
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
  standalone: true,
})
export class ServiceCard {
  @Input({ required: true }) service!: Service;
}
