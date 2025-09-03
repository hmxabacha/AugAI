import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
  [key: string]: any;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  setToken(token: string) {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // userId is stored in the "nameidentifier" claim
      const claimKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      const userId = decoded[claimKey];

      return userId ? Number(userId) : null;
    } catch (e) {
      console.error('Invalid token', e);
      return null;
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
