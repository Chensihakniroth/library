import { Component } from '@angular/core';

@Component({
  selector: 'app-update-book',
  imports: [],
  templateUrl: './update-book.html',
  styleUrl: './update-book.css'
})
export class UpdateBook {
  
      private url: string = 'http://localhost:8080/books/';

      updateBook(bookId: string, updatedData: any): void {

 }
}