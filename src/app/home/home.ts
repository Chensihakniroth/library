import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterBook } from '../filter-book/filter-book';
import { BookService, Book } from '../services/book.service';
import { Subscription } from 'rxjs';
import { AddBook } from '../add-book/add-book';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule, FilterBook, AddBook],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  selectedFilter: string = 'default';
  searchQuery: string = '';
  isLoading: boolean = true;
  books: Book[] = [];
  errorMessage: string = '';
  showAddBookPopup: boolean = false;
  private routeSubscription: Subscription;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute
  ) {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.loadBooks();
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Loading books...');
    
    this.bookService.getAllBooks().subscribe({
      next: (books: Book[]) => {
        this.books = books;
        this.isLoading = false;
        console.log('Books loaded successfully:', this.books.length);
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.errorMessage = 'Failed to load books. Please try again.';
        this.isLoading = false;
        this.books = [];
      }
    });
  }

  get hasData(): boolean {
    return this.selectedFilter !== 'onshelf';
  }

  // Get unique books for display (no duplicates, no null titles)
  get uniqueBooks() {
    const uniqueBooksMap = new Map<string, Book>();
    const bookCounts = new Map<string, number>();
    
    // Filter out books with null/empty titles and count duplicates
    this.books
      .filter(book => book.title && book.title.trim() !== '')
      .forEach(book => {
        const key = book.title.toLowerCase().trim();
        
        // Count duplicates
        bookCounts.set(key, (bookCounts.get(key) || 0) + 1);
        
        // Keep only the first occurrence of each book title
        if (!uniqueBooksMap.has(key)) {
          uniqueBooksMap.set(key, {
            ...book,
            // Store the count for display
            total_copies: bookCounts.get(key) || 1,
            available_copies: bookCounts.get(key) || 1
          });
        } else {
          // Update the count for existing book
          const existingBook = uniqueBooksMap.get(key)!;
          existingBook.total_copies = bookCounts.get(key)!;
          existingBook.available_copies = bookCounts.get(key)!;
        }
      });
    
    return Array.from(uniqueBooksMap.values());
  }

  // For search functionality - filter unique books
  get filteredBooks() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.uniqueBooks;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    return this.uniqueBooks.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  }

  // For recommended section - show first 6 unique books
  get recommendedBooks() {
    return this.uniqueBooks.slice(0, 6);
  }

  getImageUrl(imgPath: string): string {
    return this.bookService.getImageUrl(imgPath);
  }

  onFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedFilter = selectElement.value;
    
    if (this.selectedFilter === 'onshelf') {
      this.loadOnShelfBooks();
    } else {
      this.loadBooks();
    }
  }

  loadOnShelfBooks(): void {
    this.isLoading = true;
    this.bookService.filterBooksByStatus('on_shelf').subscribe({
      next: (books: Book[]) => {
        this.books = books;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading on-shelf books:', error);
        this.errorMessage = 'Failed to load on-shelf books.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.isLoading = true;
      this.bookService.searchBooks(this.searchQuery).subscribe({
        next: (books: Book[]) => {
          this.books = books;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching books:', error);
          this.errorMessage = 'Failed to search books.';
          this.isLoading = false;
        }
      });
    } else {
      this.loadBooks();
    }
  }

  onAddBook(): void {
    console.log('Opening Add Book popup');
    this.showAddBookPopup = true;
  }

  closeAddBookPopup(): void {
    this.showAddBookPopup = false;
  }

  get currentTime(): string {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  get currentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  }
}