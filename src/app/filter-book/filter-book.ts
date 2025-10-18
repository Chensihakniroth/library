import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, Book } from '../services/book.service';

@Component({
  selector: 'app-filter-book',
  imports: [CommonModule],
  templateUrl: './filter-book.html',
  styleUrl: './filter-book.css'
})
export class FilterBook implements OnChanges, OnInit {
  @Input() searchQuery: string = '';
  @Output() addBookClicked = new EventEmitter<void>();

  books: Book[] = [];
  filteredBooks: Book[] = [];
  uniqueBooks: Book[] = []; // Add this for unique books
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']) {
      this.filterBooks();
    }
  }

  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.bookService.filterBooksByStatus('on_shelf').subscribe({
      next: (books: Book[]) => {
        this.books = books;
        this.processUniqueBooks(); // Process to remove duplicates
        this.filteredBooks = [...this.uniqueBooks];
        this.isLoading = false;
        console.log('Unique books loaded:', this.uniqueBooks.length);
      },
      error: (error) => {
        console.error('Error loading on-shelf books:', error);
        this.errorMessage = 'Failed to load books. Please try again.';
        this.isLoading = false;
        this.books = [];
        this.filteredBooks = [];
        this.uniqueBooks = [];
      }
    });
  }

  // New method to remove duplicates and count copies
  processUniqueBooks(): void {
    const uniqueBooksMap = new Map<string, Book>();
    const bookCounts = new Map<string, number>();
    
    // Filter out books with null/empty titles and count duplicates
    this.books
      .filter(book => book.title && book.title.trim() !== '')
      .forEach(book => {
        const key = book.title.toLowerCase().trim();
        
        // Count total copies (sum of all duplicates)
        bookCounts.set(key, (bookCounts.get(key) || 0) + (book.total_copies || 1));
        
        // Keep only the first occurrence of each book title with updated count
        if (!uniqueBooksMap.has(key)) {
          uniqueBooksMap.set(key, {
            ...book,
            // Store the total count for display
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
    
    this.uniqueBooks = Array.from(uniqueBooksMap.values());
  }

  filterBooks(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredBooks = [...this.uniqueBooks];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredBooks = this.uniqueBooks.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }
  }

  onUpdate(book: Book): void {
    console.log('Update book:', book);
    // Add your update logic here
  }

  onDelete(book: Book): void {
    console.log('Delete book:', book);
    // Add your delete logic here
  }

  onAddBook(): void {
    console.log('Add new book from filter view');
    this.addBookClicked.emit();
  }

  getImageUrl(imgPath: string): string {
    return this.bookService.getImageUrl(imgPath);
  }
}