import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-service-card-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './service-card-skeleton.html',
  styleUrl: './service-card-skeleton.css'
})
export class ServiceCardSkeleton {}
