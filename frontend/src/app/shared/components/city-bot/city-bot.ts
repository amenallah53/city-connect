import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

@Component({
  selector: 'app-city-bot',
  imports: [CommonModule, FormsModule],
  templateUrl: './city-bot.html',
  styleUrl: './city-bot.css',
  animations: [
    trigger('chatWindow', [
      state('void', style({ opacity: 0, transform: 'scale(0.8) translateY(20px)', transformOrigin: 'bottom left' })),
      state('visible', style({ opacity: 1, transform: 'scale(1) translateY(0)', transformOrigin: 'bottom left' })),
      transition('void => visible', animate('250ms cubic-bezier(0.34, 1.56, 0.64, 1)')),
      transition('visible => void', animate('180ms ease-in')),
    ]),
    trigger('toggleBtn', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.5) rotate(-90deg)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })),
      transition('hidden => visible', animate('250ms cubic-bezier(0.34, 1.56, 0.64, 1)')),
      transition('visible => hidden', animate('180ms ease-in')),
    ]),
  ],
})

export class CityBot {
  
  fullDisplay = false;
  isTyping = false;
  userInput = '';

  messages: Message[] = [
    { text: 'Welcome to City Bot! How can I assist you today?', sender: 'bot' },
    { text: "Hi! I'm looking for some recommendations on things to do in the city.", sender: 'user' },
    { text: 'Great! Are you interested in restaurants, attractions, nightlife, or outdoor activities?', sender: 'bot' },
    { text: 'Mostly restaurants and maybe some outdoor spots!', sender: 'user' },
    { text: 'Perfect! I can suggest some great dining spots and parks. Any cuisine preferences?', sender: 'bot' },
  ];

  sendMessage() {
    if (this.userInput.trim() === '') return;
    this.messages.push({ text: this.userInput, sender: 'user' });
    this.userInput = '';
    // Simulate bot response after a delay
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      this.messages.push({ text: 'Thanks for your message! I will get back to you shortly.', sender: 'bot' });
    }
    , 1000);
  } 

  toggleDisplay() {
    this.fullDisplay = !this.fullDisplay;
  }
}