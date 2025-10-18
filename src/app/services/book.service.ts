import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/library-management-system/api';

  constructor(private http: HttpClient) {}

  // Get all books - FIXED VERSION
  getAllBooks(): Observable<Book[]> {
    return this.http.get<any>(`${this.apiUrl}/books`).pipe(
      map(response => {
        // Handle both response formats
        const booksArray = response.data || response;
        
        if (!Array.isArray(booksArray)) {
          console.error('Expected array but got:', booksArray);
          return [];
        }
        
        return booksArray.map((book: any) => ({
          ...book,
          total_copies: Number(book.total_copies) || 0,
          available_copies: Number(book.available_copies) || 0,
          img: book.img || null,
          status: (Number(book.available_copies) || 0) > 0 ? 'available' : 'unavailable',
          pages: Number(book.pages) || 0,
          publishYear: Number(book.publishYear) || new Date().getFullYear(),
          ISBN: book.ISBN || 'N/A'
        }));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error loading books:', error);
        return of([]);
      })
    );
  }

  // ▼▼▼ PASTE THE NEW METHOD HERE - REPLACE THE OLD ONE ▼▼▼
  filterBooksByStatus(status: string): Observable<Book[]> {
    return this.getAllBooks().pipe(
      map(books => {
        console.log('Total books available:', books.length);
        
        if (status === 'on_shelf') {
          // Multiple ways to identify "on shelf" books safely
          const onShelfBooks = books.filter(book => {
            return (
              book.available_copies > 0 ||           // Has available copies
              book.status?.toLowerCase() === 'available' ||  // Status is available
              book.status?.toLowerCase() === 'on_shelf' ||   // Status is on_shelf
              (book.available_copies === undefined && book.status === undefined) // Fallback
            );
          });
          
          console.log('Books filtered as on-shelf:', onShelfBooks.length);
          return onShelfBooks;
        }
        
        return books; // Safe fallback
      }),
      catchError((error) => {
        console.error('Filtering error:', error);
        return of([]); // Safe empty array on error
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
              img: book.img || null,
              pages: Number(book.pages) || 0,
              publishYear: Number(book.publishYear) || new Date().getFullYear(),
              ISBN: book.ISBN || 'N/A'
            }));
          } else if (Array.isArray(response)) {
            return response.map((book: any) => ({
              ...book,
              total_copies: Number(book.total_copies) || 0,
              available_copies: Number(book.available_copies) || 0,
              img: book.img || null,
              pages: Number(book.pages) || 0,
              publishYear: Number(book.publishYear) || new Date().getFullYear(),
              ISBN: book.ISBN || 'N/A'
            }));
          } else {
            return [];
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error searching books:', error);
          // Fallback to client-side search if API fails
          return this.getAllBooks().pipe(
            map(books => books.filter(book => 
              book.title.toLowerCase().includes(title.toLowerCase())
            ))
          );
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
              img: book.img || null,
              pages: Number(book.pages) || 0,
              publishYear: Number(book.publishYear) || new Date().getFullYear(),
              ISBN: book.ISBN || 'N/A'
            };
          } else if (response && response.id) {
            const book = response;
            return {
              ...book,
              total_copies: Number(book.total_copies) || 0,
              available_copies: Number(book.available_copies) || 0,
              img: book.img || null,
              pages: Number(book.pages) || 0,
              publishYear: Number(book.publishYear) || new Date().getFullYear(),
              ISBN: book.ISBN || 'N/A'
            };
          } else {
            throw new Error('Book not found');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error loading book:', error);
          throw error;
        })
      );
  }

  // Create new book
  createBook(bookData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/books`, bookData, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error creating book:', error);
          throw error;
        })
      );
  }

  // Update book
  updateBook(id: number, bookData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}/books/${id}`, bookData, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating book:', error);
          throw error;
        })
      );
  }

  // Delete book
  deleteBook(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/books/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error deleting book:', error);
          throw error;
        })
      );
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