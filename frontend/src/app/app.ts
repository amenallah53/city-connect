import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('city-connect');

  async postRequest() {

    const data = {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "approved",
      "submissionDate": "2026-04-17T10:00:00Z",
      "firstName": "Amenallah",
      "lastName": "Kalai",
      "cin": "12345678",
      "email": "amenkalai53@gmail.com",
      "addresse": "Ariana, Tunisia",
      "telephone": "+21612345678",
      "service": {
        "id": "srv-001",
        "type": "Business Licenses",
        "name": "Commercial Activity License",
        "badges": ["Electronic"]
      }
    }

    await fetch('https://amenallah23.app.n8n.cloud/webhook-test/7d27e881-89a9-4039-add7-b6cd784fb0ca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    console.log('post request: ', data);
  }
}