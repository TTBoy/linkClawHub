
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThemeService, Theme } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  isLoginModalOpen = signal(false);
  isDropdownOpen = signal(false);

  loginForm = this.fb.group({
    username: ['admin', Validators.required],
    password: ['123456', Validators.required]
  });

  setTheme(theme: Theme, event?: MouseEvent) {
    const x = event?.clientX;
    const y = event?.clientY;
    this.themeService.setTheme(theme, x, y);
  }

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  openLogin() {
    this.isDropdownOpen.set(false);
    this.isLoginModalOpen.set(true);
    this.authService.error.set(''); // Clear prev errors
  }

  closeLogin() {
    this.isLoginModalOpen.set(false);
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      const success = this.authService.login(username!, password!);
      if (success) {
        this.closeLogin();
      }
    }
  }

  logout() {
    this.authService.logout();
    this.isDropdownOpen.set(false);
  }
}
