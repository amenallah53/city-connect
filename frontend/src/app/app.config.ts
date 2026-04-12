import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

import { provideAnimations } from '@angular/platform-browser/animations';

// Create a custom preset that overrides the green accent
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      // PrimeNG expects a palette — point it to your CSS var
      // Easiest: override the specific component tokens
    },
    colorScheme: {
      light: {
        primary: {
          color: 'var(--primary-color)',
          hoverColor: 'var(--primary-color)',
          activeColor: 'var(--primary-color)',
        },
        highlight: {
          background: 'var(--primary-color)',  // <-- this kills the green bg
          focusBackground: 'color-mix(in srgb, var(--primary-color) 80%, white)',
          color: '#ffffff',
          focusColor: '#ffffff',
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    providePrimeNG({
        theme: {
            preset: MyPreset,
            //preset: Aura,
            options: {
              darkModeSelector: 'none'
            }
        }
    })
  ]
};