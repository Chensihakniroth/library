import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { RouterOutlet, RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterBook } from '../filter-book/filter-book';
import { BookService, Book } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { AddBook } from '../add-book/add-book';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, FilterBook, AddBook],
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
  
  currentTime: string = '';
  currentDate: string = '';
  
  private routeSubscription: Subscription;
  private authSubscription: Subscription | undefined;
  private timerId: any = null; // Changed from Subscription to timer ID

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone // Use NgZone instead of ChangeDetectorRef for clock
  ) {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.loadBooks();
    });
  }

  ngOnInit(): void {
    console.log('HomeComponent initialized');
    
    // Initialize clock immediately
    this.updateClock();
    
    // Use NgZone to run the timer outside Angular and trigger change detection properly
    this.ngZone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        // Run inside Angular zone to trigger change detection
        this.ngZone.run(() => {
          this.updateClock();
        });
      }, 1000);
    });

    // Check authentication state
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to authentication state changes
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.loadBooks();
      } else {
        this.books = [];
        this.router.navigate(['/login']);
      }
    });

    // Force load books immediately
    this.loadBooks();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.timerId) {
      clearInterval(this.timerId); // Clear the interval
    }
  }

  loadBooks(): void {
    if (this.isLoading && this.books.length > 0) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.bookService.getAllBooks().subscribe({
      next: (books: Book[]) => {
        this.books = books;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load books. Please try again.';
        this.isLoading = false;
        this.books = [];
      }
    });
  }

  // SIMPLIFIED Update clock method - no manual change detection needed
  private updateClock(): void {
    const now = new Date();
    
    this.currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });

    this.currentDate = now.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  }

  // ... rest of your methods remain the same (hasData, uniqueBooks, filteredBooks, etc.)
  get hasData(): boolean {
    return this.selectedFilter !== 'onshelf';
  }

  // Get unique books for display (no duplicates, no null titles)
  get uniqueBooks() {
    const uniqueBooksMap = new Map<string, Book>();
    const bookCounts = new Map<string, number>();
    
    this.books
      .filter(book => book.title && book.title.trim() !== '')
      .forEach(book => {
        const key = book.title.toLowerCase().trim();
        
        bookCounts.set(key, (bookCounts.get(key) || 0) + 1);
        
        if (!uniqueBooksMap.has(key)) {
          uniqueBooksMap.set(key, {
            ...book,
            total_copies: bookCounts.get(key) || 1,
            available_copies: bookCounts.get(key) || 1
          });
        } else {
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
          this.errorMessage = 'Failed to search books.';
          this.isLoading = false;
        }
      });
    } else {
      this.loadBooks();
    }
  }

  onAddBook(): void {
    this.showAddBookPopup = true;
  }

  closeAddBookPopup(): void {
    this.showAddBookPopup = false;
  }

  onBookAdded(): void {
    this.showAddBookPopup = false;
    this.loadBooks();
  }

  refreshBooks(): void {
    this.loadBooks();
  }

  logout(): void {
    this.authService.logout();
  }

  getUserProfileImage(): string {
    const user = this.authService.getCurrentUser();
    if (user?.profile_image) {
      return user.profile_image;
    }
    return 'assets/default-avatar.png';
  }

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'User';
  }
}