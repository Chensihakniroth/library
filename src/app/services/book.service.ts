import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface Book {
  id: number;
  title: string;
  author: string;
  status: string;
  img: string;
  created_at: string;
  total_copies: number;
  available_copies: number;
  publishYear: number;
  ISBN: string;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/library-management-system/api';

  constructor(private http: HttpClient) {}

  // Improved getAllBooks with better error handling
  getAllBooks(): Observable<Book[]> {
    return this.http.get<ApiResponse<Book[]>>(`${this.apiUrl}/books`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch books');
        }

        const booksArray = response.data || [];
        
        if (!Array.isArray(booksArray)) {
          console.warn('Expected array but got:', booksArray);
          return [];
        }
        
        return booksArray.map((book: any) => this.transformBookData(book));
      }),
      catchError(this.handleError<Book[]>('getAllBooks', []))
    );
  }

  // Improved filter with better logic
  filterBooksByStatus(status: string): Observable<Book[]> {
    return this.getAllBooks().pipe(
      map(books => {
        console.log(`🔍 Filtering ${books.length} books by status: ${status}`);
        
        if (status === 'on_shelf') {
          return books.filter(book => 
            book.available_copies > 0 || 
            book.status?.toLowerCase().includes('available') ||
            book.status?.toLowerCase().includes('on_shelf')
          );
        }
        
        return books;
      }),
      catchError(this.handleError<Book[]>('filterBooksByStatus', []))
    );
  }

  // Improved search with better typing
  searchBooks(title: string): Observable<Book[]> {
    if (!title.trim()) {
      return of([]);
    }

    const params = new HttpParams().set('title', title.trim());
    
    return this.http.get<ApiResponse<Book[]>>(`${this.apiUrl}/books/search`, { params })
      .pipe(
        map(response => {
          if (response.success && Array.isArray(response.data)) {
            return response.data.map(book => this.transformBookData(book));
          }
          return [];
        }),
        catchError(error => {
          console.warn('Search API failed, falling back to client-side search:', error);
          return this.getAllBooks().pipe(
            map(books => books.filter(book => 
              book.title.toLowerCase().includes(title.toLowerCase())
            ))
          );
        })
      );
  }

  // Improved getBookById with better error handling
  getBookById(id: number): Observable<Book> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid book ID'));
    }

    return this.http.get<ApiResponse<Book>>(`${this.apiUrl}/books/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.transformBookData(response.data);
          }
          throw new Error(response.message || 'Book not found');
        }),
        catchError(this.handleError<Book>('getBookById'))
      );
  }

  // Improved updateBook with better typing and error handling
  updateBook(id: number, bookData: Partial<Book>): Observable<ApiResponse<any>> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid book ID'));
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    // Only send updatable fields
    const updateData = {
      title: bookData.title,
      author: bookData.author,
      publishYear: bookData.publishYear,
      ISBN: bookData.ISBN || '',
      pages: bookData.pages || null,
      img: bookData.img || '/images/default-book.jpg'
    };

    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/books/${id}`, 
      updateData, 
      { headers }
    ).pipe(
      catchError(this.handleError<ApiResponse<any>>('updateBook'))
    );
  }

  // Improved createBook
  createBook(bookData: any): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/books`, 
      bookData, 
      { headers }
    ).pipe(
      catchError(this.handleError<ApiResponse<any>>('createBook'))
    );
  }

  // Improved deleteBook
  deleteBook(id: number): Observable<ApiResponse<any>> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid book ID'));
    }

    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/books/${id}`)
      .pipe(
        catchError(this.handleError<ApiResponse<any>>('deleteBook'))
      );
  }

  // Improved image URL handling
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

  // Private helper methods
  private transformBookData(book: any): Book {
    return {
      ...book,
      total_copies: Number(book.total_copies) || 0,
      available_copies: Number(book.available_copies) || 0,
      img: book.img || null,
      status: (Number(book.available_copies) || 0) > 0 ? 'available' : 'unavailable',
      pages: Number(book.pages) || 0,
      publishYear: Number(book.publishYear) || new Date().getFullYear(),
      ISBN: book.ISBN || 'N/A'
    };
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      const userMessage = this.getUserFriendlyErrorMessage(error);
      
      // You could show a toast notification here
      console.error('User-friendly error:', userMessage);
      
      // If a default result is provided, return it
      if (result !== undefined) {
        return of(result as T);
      }
      
      return throwError(() => new Error(userMessage));
    };
  }

  private getUserFriendlyErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return 'A network error occurred. Please check your connection.';
    }
    
    // Server-side error
    switch (error.status) {
      case 0:
        return 'Cannot connect to server. Please make sure the backend is running.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.error?.message || `An unexpected error occurred (${error.status}).`;
    }
  }
}