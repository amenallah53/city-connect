// layouts/simple-layout/simple-layout.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-simple-layout',
  imports: [RouterOutlet],
  templateUrl: './simple-layout.html',
  styleUrl: './simple-layout.css',
  standalone: true
})
export class SimpleLayout {

}
