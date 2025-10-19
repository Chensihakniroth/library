import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  name: string;
  email: string;
  token?: string;
  role?: string;
  profile_image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/library-management-system/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
  private http: HttpClient,
  @Inject(PLATFORM_ID) private platformId: any
) {
  this.isBrowser = isPlatformBrowser(this.platformId);
  
  let storedUser: User | null = null;
  if (this.isBrowser && typeof localStorage !== 'undefined') {
    try {
      const userData = localStorage.getItem('currentUser');
      console.log('Found stored user data:', userData);
      storedUser = userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      storedUser = null;
    }
  }
  
  this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
  this.currentUser = this.currentUserSubject.asObservable();
  
  console.log('AuthService initialized, user:', storedUser);
}

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/register`, data, { headers });
  }

  login(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/login`, data, { headers }).pipe(
      map(response => {
        if (response.success && response.user) {
          const user: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            token: response.token,
            role: response.user.role,
            profile_image: response.user.profile_image
          };
          this.setUser(user);
        }
        return response;
      })
    );
  }

  // Store user data after login
  setUser(user: User): void {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (user.token) {
          localStorage.setItem('token', user.token);
        }
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
    this.currentUserSubject.next(user);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Logout
  logout(): void {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('rememberMe');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
    this.currentUserSubject.next(null);
  }

  // Get authentication token
  getToken(): string | null {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem('token');
      } catch (error) {
        console.error('Error reading token from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  // Get user role
  getUserRole(): string {
    const user = this.getCurrentUser();
    return user?.role || 'librarian';
  }

  // Get profile image
  getProfileImage(): string | null {
    const user = this.getCurrentUser();
    return user?.profile_image || null;
  }

  // Check if remember me was set
  isRememberMe(): boolean {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem('rememberMe') === 'true';
      } catch (error) {
        console.error('Error reading rememberMe from localStorage:', error);
        return false;
      }
    }
    return false;
  }

  // Clear remember me
  clearRememberMe(): void {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('rememberMe');
      } catch (error) {
        console.error('Error clearing rememberMe from localStorage:', error);
      }
    }
  }

  // Auto-login if remember me is enabled and token exists
  autoLogin(): boolean {
    if (this.isRememberMe() && this.isLoggedIn()) {
      return true;
    }
    return false;
  }

  // Force refresh user data (useful when coming back to app)
  refreshUserState(): void {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          this.currentUserSubject.next(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error refreshing user state:', error);
      }
    }
  }

  // Safe localStorage setter
  private setLocalStorage(key: string, value: string): void {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error(`Error setting ${key} in localStorage:`, error);
      }
    }
  }

  // Safe localStorage getter
  private getLocalStorage(key: string): string | null {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error(`Error getting ${key} from localStorage:`, error);
        return null;
      }
    }
    return null;
  }

  // Safe localStorage remover
  private removeLocalStorage(key: string): void {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
      }
    }
  }
}