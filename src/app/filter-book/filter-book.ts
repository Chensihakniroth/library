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
  
  // TEMPORARY: Load ALL books instead of filtered ones for testing
  this.bookService.getAllBooks().subscribe({
    next: (books: Book[]) => {
      this.books = books;
      this.filteredBooks = [...this.books];
      this.isLoading = false;
      console.log('ALL books loaded (temporary):', this.books.length);
      console.log('Books details:', this.books);
    },
    error: (error) => {
      console.error('Error loading books:', error);
      this.errorMessage = 'Failed to load books. Please try again.';
      this.isLoading = false;
      this.books = [];
      this.filteredBooks = [];
    }
  });
}

  filterBooks(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredBooks = [...this.books];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredBooks = this.books.filter(book => 
        book.title.toLowerCase().includes(query)
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