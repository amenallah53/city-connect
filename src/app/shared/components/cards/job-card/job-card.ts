import { Component, Input } from '@angular/core';
import { Prestataire } from '../../../models/prestataire.model';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './job-card.html',
  styleUrl: './job-card.css',
})
export class JobCard {
  @Input() job!: Prestataire;
}
