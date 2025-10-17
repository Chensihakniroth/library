import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // FIXED: Remove /auth from the API URL
  private apiUrl = 'http://localhost:8080/library-management-system/api';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/register`, data, { headers });
  }

  login(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/login`, data, { headers });
  }

  // Store user data after login
  setUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', user.token);
  }

  // Get current user
  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Logout
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
  }

  // NEW: Get authentication token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // NEW: Get user role (you can expand this based on your user model)
  getUserRole(): string {
    const user = this.getCurrentUser();
    return user?.role || 'librarian'; // Default role
  }

  // NEW: Check if remember me was set
  isRememberMe(): boolean {
    return localStorage.getItem('rememberMe') === 'true';
  }

  // NEW: Clear remember me
  clearRememberMe(): void {
    localStorage.removeItem('rememberMe');
  }

  // NEW: Auto-login if remember me is enabled and token exists
  autoLogin(): boolean {
    if (this.isRememberMe() && this.isLoggedIn()) {
      return true;
    }
    return false;
  }
}