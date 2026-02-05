
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

export interface User {
  username: string;
  avatarUrl: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  currentUser = signal<User | null>(null);
  error = signal<string>('');
  private apiUrl = 'http://localhost:3000/api';

  constructor() {
    // Simulate session check
    const saved = localStorage.getItem('clawhub_user');
    if (saved) {
      this.currentUser.set(JSON.parse(saved));
    }
  }

  login(username: string, password: string) {
    // Reset error
    this.error.set('');

    this.http.post<{user: User}>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        // Fallback for demo when backend is offline
        catchError(err => {
          console.warn('Backend unavailable, checking credentials locally.');
          if (username === 'admin' && password === '123456') {
            return of({
              user: {
                username: 'admin',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                token: 'mock-token-local'
              }
            });
          }
          // If credentials wrong locally, re-throw or return error
          return throwError(() => ({ error: { message: '用户名或密码无效 (Mock: try admin/123456)' } }));
        })
      )
      .subscribe({
        next: (response) => {
          this.currentUser.set(response.user);
          localStorage.setItem('clawhub_user', JSON.stringify(response.user));
        },
        error: (err) => {
          console.error('Login failed', err);
          this.error.set(err.error?.message || 'Login failed.');
        }
      });

    return true; 
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('clawhub_user');
  }
}
