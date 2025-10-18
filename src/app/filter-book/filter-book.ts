import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../services/book.service';

@Component({
  selector: 'app-filter-book',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-book.html',
  styleUrl: './filter-book.css'
})
export class FilterBook implements OnChanges, OnInit {
  @Input() searchQuery: string = '';
  @Output() addBookClicked = new EventEmitter<void>();
  @Output() booksUpdated = new EventEmitter<void>();

  books: Book[] = [];
  filteredBooks: Book[] = [];
  uniqueBooks: Book[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  // Update modal properties
  showUpdateModal: boolean = false;
  selectedBook: Book | null = null;
  updateFormData: any = {};
  isUpdating: boolean = false;

  // Delete modal properties
  showDeleteModal: boolean = false;
  bookToDelete: Book | null = null;
  isDeleting: boolean = false;

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
    
    this.bookService.getAllBooks().subscribe({
      next: (allBooks: Book[]) => {
        this.books = allBooks;
        this.processUniqueBooks();
        this.filteredBooks = [...this.uniqueBooks];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.errorMessage = 'Failed to load books. Please try again.';
        this.isLoading = false;
      }
    });
  }

  processUniqueBooks(): void {
    const uniqueBooksMap = new Map<string, Book>();
    const bookCounts = new Map<string, number>();
    
    this.books
      .filter(book => book.title && book.title.trim() !== '')
      .forEach(book => {
        const key = book.title.toLowerCase().trim();
        
        bookCounts.set(key, (bookCounts.get(key) || 0) + (book.total_copies || 1));
        
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

  // UPDATE METHODS
  onUpdate(book: Book): void {
    console.log('Update book:', book);
    this.selectedBook = book;
    this.updateFormData = {
      title: book.title,
      author: book.author,
      pages: book.pages,
      ISBN: book.ISBN,
      publishYear: book.publishYear
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedBook = null;
    this.updateFormData = {};
    this.isUpdating = false;
  }

  submitUpdate(): void {
    if (!this.selectedBook) return;

    this.isUpdating = true;
    
    this.bookService.updateBook(this.selectedBook.id, this.updateFormData).subscribe({
      next: (response) => {
        console.log('Book updated successfully:', response);
        this.isUpdating = false;
        this.closeUpdateModal();
        this.loadBooks();
        this.booksUpdated.emit();
      },
      error: (error) => {
        console.error('Error updating book:', error);
        this.errorMessage = 'Failed to update book. Please try again.';
        this.isUpdating = false;
      }
    });
  }

  // DELETE METHODS
  onDelete(book: Book): void {
    console.log('Delete book:', book);
    this.bookToDelete = book;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.bookToDelete = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (!this.bookToDelete) return;

    this.isDeleting = true;
    console.log('Attempting to delete book:', this.bookToDelete.title, 'ID:', this.bookToDelete.id);

    // Store the book data in local variables before the async operation
    const bookId = this.bookToDelete.id;
    const bookTitle = this.bookToDelete.title;

    // Use the actual API endpoint
    this.bookService.deleteBook(bookId).subscribe({
      next: (response) => {
        console.log('Book deleted successfully:', response);
        this.isDeleting = false;
        
        // Remove the book from the local arrays using the stored ID
        this.books = this.books.filter(book => book.id !== bookId);
        this.uniqueBooks = this.uniqueBooks.filter(book => book.id !== bookId);
        this.filteredBooks = this.filteredBooks.filter(book => book.id !== bookId);
        
        this.closeDeleteModal();
        console.log('Book deleted from database and UI');
        
        // Show success message
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error deleting book:', error);
        this.errorMessage = 'Failed to delete book. Please try again.';
        this.isDeleting = false;
        
        // If API fails, fall back to UI-only deletion for testing
        console.log('API delete failed, falling back to UI deletion');
        
        // Use the stored ID for filtering
        this.books = this.books.filter(book => book.id !== bookId);
        this.uniqueBooks = this.uniqueBooks.filter(book => book.id !== bookId);
        this.filteredBooks = this.filteredBooks.filter(book => book.id !== bookId);
        
        this.closeDeleteModal();
      }
    });
  }

  onAddBook(): void {
    this.addBookClicked.emit();
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getImageUrl(imgPath: string): string {
    return this.bookService.getImageUrl(imgPath);
  }
}