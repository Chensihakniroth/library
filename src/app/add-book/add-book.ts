import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-book',
  imports: [],
  templateUrl: './add-book.html',
  styleUrl: './add-book.css'
})
export class AddBook {
  @Output() close = new EventEmitter<void>();

  closePopup(): void {
    this.close.emit();
  }
}