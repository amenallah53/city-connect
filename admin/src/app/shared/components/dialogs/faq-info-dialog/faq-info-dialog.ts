import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Faq } from '../../../models/faq.model';

@Component({
  selector: 'app-faq-info-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-info-dialog.html',
  styleUrl: './faq-info-dialog.css'
})
export class FaqInfoDialog implements OnInit {
  faq!: Faq;

  constructor(public config: DynamicDialogConfig) {}

  ngOnInit() {
    this.faq = this.config.data?.faq;
  }
}
