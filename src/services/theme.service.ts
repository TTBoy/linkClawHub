
import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<Theme>('system');

  constructor() {
    // Listen for system changes dynamically
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.theme() === 'system') {
        this.applyTheme('system');
      }
    });

    effect(() => {
      // We only apply the theme automatically if it wasn't triggered by a transition
      // The actual class toggling is now handled in setTheme for manual clicks
      // or here for initialization.
      this.applyTheme(this.theme());
    });
  }

  private applyTheme(t: Theme) {
    const html = document.documentElement;
    let isDark = false;
    
    if (t === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = t === 'dark';
    }

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  /**
   * Sets the theme with an optional View Transition effect starting from (x, y).
   */
  setTheme(t: Theme, x?: number, y?: number) {
    // If browser doesn't support view transitions or no coordinates provided, just switch
    if (!(document as any).startViewTransition || x === undefined || y === undefined) {
      this.theme.set(t);
      this.applyTheme(t);
      return;
    }

    const transition = (document as any).startViewTransition(() => {
      this.theme.set(t);
      this.applyTheme(t);
    });

    transition.ready.then(() => {
      // Calculate distance to the furthest corner
      const right = window.innerWidth - x;
      const bottom = window.innerHeight - y;
      const radius = Math.hypot(
        Math.max(x, right),
        Math.max(y, bottom)
      );

      // Animate the circle
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  }
}
