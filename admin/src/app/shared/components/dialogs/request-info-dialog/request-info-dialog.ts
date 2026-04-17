import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-request-info-dialog',
  standalone: true,
  imports: [CommonModule],
  providers: [DialogService],
  templateUrl: './request-info-dialog.html',
  styleUrl: './request-info-dialog.css'
})
export class RequestInfoDialog implements OnInit {
  req: any;

  constructor(public config: DynamicDialogConfig) {}

  ngOnInit() {
    this.req = this.config.data?.req;
  }
}
