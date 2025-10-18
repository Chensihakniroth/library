import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';

interface BookForm {
  title: string;
  publishYear: string;  // Exact database field name
  author: string;
  ISBN: string;         // Exact database field name (uppercase)
  page: string;
  image: File | null;
  imagePreview: string;
}

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book.html',
  styleUrl: './add-book.css'
})
export class AddBook {
  @Output() close = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  book: BookForm = {
    title: '',
    publishYear: '',
    author: '',
    ISBN: '',
    page: '',
    image: null,
    imagePreview: ''
  };

  isUploading: boolean = false;
  uploadProgress: number = 0;

  constructor(private http: HttpClient) {}

  // Handle file selection
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, JPEG, or PNG)');
        this.clearFileInput();
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        this.clearFileInput();
        return;
      }

      this.book.image = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.book.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Trigger file input click
  triggerFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    } else {
      const fileInput = document.getElementById('bookImage') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  // Clear file input
  clearFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.book.image = null;
    this.book.imagePreview = '';
  }

  // Add book to database
  addBook(): void {
    // Validate form
    if (!this.book.title || !this.book.author || !this.book.publishYear) {
      alert('Please fill in all required fields: Title, Author, and Publish Year');
      return;
    }

    // Validate publish year
    const currentYear = this.getCurrentYear();
    const publishYear = parseInt(this.book.publishYear);
    if (isNaN(publishYear) || publishYear < 1000 || publishYear > currentYear) {
      alert(`Please enter a valid publish year (1000-${currentYear})`);
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    const formData = new FormData();
    
    // Add book data as JSON - EXACT DATABASE FIELD NAMES
    const bookData = {
      title: this.book.title,
      publishYear: this.book.publishYear,  // Exact database field name
      author: this.book.author,
      ISBN: this.book.ISBN,                // Exact database field name (uppercase)
      page: this.book.page ? parseInt(this.book.page) : null
    };
    
    console.log('Sending book data:', bookData); // For debugging
    
    formData.append('bookData', JSON.stringify(bookData));

    // Add image file if selected
    if (this.book.image) {
      formData.append('bookImage', this.book.image, this.book.image.name);
    }

    // Send to your existing api.php
    this.http.post('http://localhost:8080/library-management-system/api/books', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          const response = event.body;
          console.log('API Response:', response); // For debugging
          
          if (response.success) {
            alert('Book added successfully!');
            this.closePopup();
          } else {
            alert('Error: ' + response.message);
          }
          this.isUploading = false;
          this.uploadProgress = 0;
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert('Failed to add book. Please try again.');
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  closePopup(): void {
    this.close.emit();
  }

  // Get current year for validation
  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}