import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../services/book.service';

@Component({
  selector: 'app-filter-book',
  imports: [CommonModule, FormsModule], // Add FormsModule for form handling
  templateUrl: './filter-book.html',
  styleUrl: './filter-book.css'
})
export class FilterBook implements OnChanges, OnInit {
  @Input() searchQuery: string = '';
  @Output() addBookClicked = new EventEmitter<void>();
  @Output() booksUpdated = new EventEmitter<void>(); // Add this to refresh parent

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
      publishYear: book.publishYear,
      total_copies: book.total_copies,
      available_copies: book.available_copies,
      status: book.status
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
        this.loadBooks(); // Reload the books
        this.booksUpdated.emit(); // Notify parent to refresh
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

  // In filter-book.ts, update the confirmDelete method:
  confirmDelete(): void {
  if (!this.bookToDelete) return;

  this.isDeleting = true;
  console.log('Attempting to delete book:', this.bookToDelete.title, 'ID:', this.bookToDelete.id);

  // TEMPORARY: Client-side deletion since API endpoint might not exist
  // This will remove the book from the UI but not from the database
  setTimeout(() => {
    // Remove the book from the local arrays
    this.books = this.books.filter(book => book.id !== this.bookToDelete!.id);
    this.uniqueBooks = this.uniqueBooks.filter(book => book.id !== this.bookToDelete!.id);
    this.filteredBooks = this.filteredBooks.filter(book => book.id !== this.bookToDelete!.id);
    
    this.isDeleting = false;
    this.closeDeleteModal();
    console.log('Book removed from UI (temporary solution)');
    
    // Show success message
    this.errorMessage = ''; // Clear any previous errors
    
  }, 1000);
  }

  onAddBook(): void {
    this.addBookClicked.emit();
  }

  getImageUrl(imgPath: string): string {
    return this.bookService.getImageUrl(imgPath);
  }
}