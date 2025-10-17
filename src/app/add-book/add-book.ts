import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-add-book',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book.html',
  styleUrl: './add-book.css'
})
export class AddBook {
  @Output() close = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  bookData = {
    title: '',
    publishYear: '',
    bookCreateAt: '',
    author: '',
    isbn: '',
    pages: '',
    imageFile: null as File | null
  };

  isUploading = false;
  uploadError = '';
  selectedFileName = '';
  imagePreview: string | null = null;

  constructor(private bookService: BookService) {}

  // Handle file selection
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Check if file is an image
      if (!file.type.match('image.*')) {
        this.uploadError = 'Please select a valid image file (JPEG, PNG, etc.)';
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'Image size should be less than 5MB';
        return;
      }

      this.bookData.imageFile = file;
      this.selectedFileName = file.name;
      this.uploadError = '';

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      console.log('File processed successfully');
    }
  }

  // Trigger file input click
  triggerFileInput(): void {
    console.log('Triggering file input click');
    this.fileInput.nativeElement.click();
  }

  // Add book to database
  addBook(): void {
    console.log('Add book clicked');
    
    // Basic validation
    if (!this.bookData.title.trim()) {
      this.uploadError = 'Book title is required';
      return;
    }

    if (!this.bookData.author.trim()) {
      this.uploadError = 'Author is required';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append('title', this.bookData.title);
    formData.append('publishYear', this.bookData.publishYear);
    formData.append('bookCreateAt', this.bookData.bookCreateAt);
    formData.append('author', this.bookData.author);
    formData.append('isbn', this.bookData.isbn);
    formData.append('pages', this.bookData.pages);
    
    if (this.bookData.imageFile) {
      formData.append('image', this.bookData.imageFile, this.bookData.imageFile.name);
    }

    console.log('Sending form data to API...');

    // Call the service to create book
    this.bookService.createBookWithImage(formData).subscribe({
      next: (response) => {
        console.log('Book created successfully:', response);
        this.isUploading = false;
        this.closePopup();
        // Reset form
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating book:', error);
        this.uploadError = 'Failed to add book. Please try again.';
        this.isUploading = false;
      }
    });
  }

  // Reset form
  resetForm(): void {
    this.bookData = {
      title: '',
      publishYear: '',
      bookCreateAt: '',
      author: '',
      isbn: '',
      pages: '',
      imageFile: null
    };
    this.selectedFileName = '';
    this.uploadError = '';
    this.imagePreview = null;
  }

  closePopup(): void {
    this.close.emit();
  }

  // Remove image
  removeImage(): void {
    this.bookData.imageFile = null;
    this.selectedFileName = '';
    this.imagePreview = null;
    this.fileInput.nativeElement.value = '';
  }
}