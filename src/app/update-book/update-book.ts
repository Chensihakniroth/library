import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookService, Book } from '../services/book.service';

@Component({
  selector: 'app-update-book',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-book.html',
  styleUrl: './update-book.css'
})
export class UpdateBook implements OnInit {
  @Input() book!: Book;
  @Output() close = new EventEmitter<void>();
  @Output() bookUpdated = new EventEmitter<Book>();

  updateForm!: FormGroup;
  isUpdating: boolean = false;
  errorMessage: string = '';

  constructor(
    private bookService: BookService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.updateForm = this.fb.group({
      title: [this.book.title, [Validators.required, Validators.minLength(1)]],
      author: [this.book.author, [Validators.required, Validators.minLength(2)]],
      publishYear: [
        this.book.publishYear, 
        [Validators.required, Validators.min(1000), Validators.max(this.getCurrentYear())]
      ],
      pages: [
        this.book.pages, 
        [Validators.min(1)]
      ],
      ISBN: [
        this.book.ISBN,
        [Validators.pattern(/^(?:\d{10}|\d{13})$/)] // Basic ISBN validation
      ]
    });
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  closePopup(): void {
    this.close.emit();
  }

  updateBook(): void {
    if (this.updateForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isUpdating = true;
    this.errorMessage = '';

    const updateData = {
      ...this.updateForm.value,
      img: this.book.img // Preserve existing image
    };

    this.bookService.updateBook(this.book.id, updateData).subscribe({
      next: (response) => {
        console.log('Book updated successfully:', response);
        this.isUpdating = false;
        
        // Emit the updated book with merged data
        const updatedBook = { ...this.book, ...updateData };
        this.bookUpdated.emit(updatedBook);
        this.closePopup();
      },
      error: (error) => {
        console.error('Error updating book:', error);
        this.isUpdating = false;
        this.errorMessage = error.message || 'Error updating book. Please try again.';
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.updateForm.controls).forEach(key => {
      const control = this.updateForm.get(key);
      control?.markAsTouched();
    });
  }

  // Form field getters for easy template access
  get title() { return this.updateForm.get('title'); }
  get author() { return this.updateForm.get('author'); }
  get publishYear() { return this.updateForm.get('publishYear'); }
  get pages() { return this.updateForm.get('pages'); }
  get ISBN() { return this.updateForm.get('ISBN'); }

  getImageUrl(imgPath: string | null): string {
    return this.bookService.getImageUrl(imgPath);
  }
}