// layouts/default-layout/default-layout.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { CityBot } from '../../shared/components/city-bot/city-bot';


@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet,CommonModule, Header, Footer, CityBot],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.css',
  standalone: true
})
export class DefaultLayout {
  // make auth a public property so template can access it
  //constructor(public auth: UserAuthService) {}
}
