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
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/library-management-system/api';

  constructor(private http: HttpClient) {}

  // Get all books
  getAllBooks(): Observable<Book[]> {
    console.log('Fetching books from:', `${this.apiUrl}/books`);
    return this.http.get<any>(`${this.apiUrl}/books`)
      .pipe(
        map(response => {
          console.log('Raw API response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            // Convert string numbers to actual numbers and handle null images
            const processedBooks = response.data.map((book: any) => ({
              ...book,
              total_copies: Number(book.total_copies) || 0,
              available_copies: Number(book.available_copies) || 0,
              img: book.img || null,
              // Add a default status based on available copies
              status: (Number(book.available_copies) || 0) > 0 ? 'available' : 'unavailable'
            }));
            
            return processedBooks;
          } else {
            console.error('Unexpected API response format:', response);
            throw new Error('Unexpected response format from server');
          }
        })
      );
  }

  // Get book by ID
  getBookById(id: number): Observable<Book> {
    return this.http.get<any>(`${this.apiUrl}/books/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const book = response.data;
            return {
              ...book,
              total_copies: Number(book.total_copies) || 0,
              available_copies: Number(book.available_copies) || 0,
              img: book.img || null
            };
          } else if (response && response.id) {
            const book = response;
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

  // Search books by title
  searchBooks(title: string): Observable<Book[]> {
    const params = new HttpParams().set('title', title);
    return this.http.get<any>(`${this.apiUrl}/books/search`, { params })
      .pipe(
        map(response => {
          if (response.success && Array.isArray(response.data)) {
            return response.data.map((book: any) => ({
              ...book,
              total_copies: Number(book.total_copies) || 0,
              available_copies: Number(book.available_copies) || 0,
              img: book.img || null
            }));
          } else if (Array.isArray(response)) {
            return response.map((book: any) => ({
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

  // Filter books by status
  filterBooksByStatus(status: string): Observable<Book[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<any>(`${this.apiUrl}/books/filter`, { params })
      .pipe(
        map(response => {
          if (response.success && Array.isArray(response.data)) {
            return response.data.map((book: any) => ({
              ...book,
              total_copies: Number(book.total_copies) || 0,
              available_copies: Number(book.available_copies) || 0,
              img: book.img || null
            }));
          } else if (Array.isArray(response)) {
            return response.map((book: any) => ({
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

  // Create new book
  createBook(bookData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/books`, bookData, { headers });
  }

  // Update book
  updateBook(id: number, bookData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}/books/${id}`, bookData, { headers });
  }

  // Delete book
  deleteBook(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/books/${id}`);
  }

  // Get image URL - handle both absolute and relative paths
  getImageUrl(imgPath: string | null): string {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop';
    }
    
    // If imgPath is already a full URL
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    
    // If imgPath starts with /, it's relative to the domain root
    if (imgPath.startsWith('/')) {
      return `http://localhost:8080${imgPath}`;
    }
    
    // Otherwise, assume it's relative to your uploads folder
    return `http://localhost:8080/library-management-system/uploads/${imgPath}`;
  }
}