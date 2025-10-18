import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-ask',
  imports: [CommonModule],
  templateUrl: './delete-ask.html',
  styleUrl: './delete-ask.css'
})
export class DeleteAsk {
  @Input() bookTitle: string = '';
  @Input() bookAuthor: string = '';
  @Input() isDeleting: boolean = false;
  
  @Output() discard = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onDiscard(): void {
    this.discard.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}