import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Book {
  id: number;
  title: string;
  author: string;
  status: string;
  img: string;
  created_at: string;
  total_copies: number;
  available_copies: number;
  publishYear?: string;
  ISBN?: string;
  pages?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/library-management-system/api';

  constructor(private http: HttpClient) {}

  // Get all books
  getAllBooks(): Observable<Book[]> {
    return this.http.get<any>(`${this.apiUrl}/books`).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data.map((book: any) => ({
            ...book,
            total_copies: Number(book.total_copies) || 0,
            available_copies: Number(book.available_copies) || 0,
            img: book.img || null,
            status: (Number(book.available_copies) || 0) > 0 ? 'available' : 'unavailable'
          }));
        } else {
          throw new Error('Unexpected response format from server');
        }
      })
    );
  }

  // Create new book with image upload
  createBookWithImage(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/books/upload`, formData);
  }

  // Keep all your other existing methods...
  getBookById(id: number): Observable<Book> {
    return this.http.get<any>(`${this.apiUrl}/books/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          const book = response.data;
          return {
            ...book,
            total_copies: Number(book.total_copies) || 0,
            available_copies: Number(book.available_copies) || 0,
            img: book.img || null
          };
        } else {
          throw new Error('Book not found');
        }
      })
    );
  }

  searchBooks(title: string): Observable<Book[]> {
    const params = new HttpParams().set('title', title);
    return this.http.get<any>(`${this.apiUrl}/books/search`, { params }).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data.map((book: any) => ({
            ...book,
            total_copies: Number(book.total_copies) || 0,
            available_copies: Number(book.available_copies) || 0,
            img: book.img || null
          }));
        } else {
          return [];
        }
      })
    );
  }

  filterBooksByStatus(status: string): Observable<Book[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<any>(`${this.apiUrl}/books/filter`, { params }).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data.map((book: any) => ({
            ...book,
            total_copies: Number(book.total_copies) || 0,
            available_copies: Number(book.available_copies) || 0,
            img: book.img || null
          }));
        } else {
          return [];
        }
      })
    );
  }

  createBook(bookData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/books`, bookData, { headers });
  }

  updateBook(id: number, bookData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}/books/${id}`, bookData, { headers });
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/books/${id}`);
  }

  getImageUrl(imgPath: string | null): string {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop';
    }
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    if (imgPath.startsWith('/')) {
      return `http://localhost:8080${imgPath}`;
    }
    return `http://localhost:8080/library-management-system/uploads/${imgPath}`;
  }
}