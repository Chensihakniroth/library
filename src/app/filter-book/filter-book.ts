import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Book {
  title: string;
  author: string;
  year: number;
  pages: number;
  isbn: string;
  publisherYear: number;
  status: string;
  coverUrl: string;
}

@Component({
  selector: 'app-filter-book',
  imports: [CommonModule],
  templateUrl: './filter-book.html',
  styleUrl: './filter-book.css'
})
export class FilterBook implements OnChanges {
  @Input() searchQuery: string = '';

  books: Book[] = [
    {
      title: 'The Design of Everyday Things',
      author: 'Don Norman',
      year: 1988,
      pages: 56,
      isbn: '978-3-16-148410-0',
      publisherYear: 2000,
      status: 'Borrowed',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/416Hql52NCL._SX327_BO1,204,203,200_.jpg'
    },
    {
      title: 'Don\'t Make Me Think',
      author: 'Steve Krug',
      year: 2000,
      pages: 216,
      isbn: '978-0-321-96551-6',
      publisherYear: 2000,
      status: 'Available',
      coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop'
    },
    {
      title: 'Sprint: How to Solve Big Problems',
      author: 'Jake Knapp',
      year: 2016,
      pages: 274,
      isbn: '978-1-501-12174-6',
      publisherYear: 2016,
      status: 'Available',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'
    },
    {
      title: 'Lean UX',
      author: 'Jeff Gothelf',
      year: 2016,
      pages: 304,
      isbn: '978-1-491-95375-5',
      publisherYear: 2016,
      status: 'Borrowed',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'
    },
    {
      title: 'Rich Dad Poor Dad',
      author: 'Robert T Kiyosaki',
      year: 1997,
      pages: 336,
      isbn: '978-1-612-68005-5',
      publisherYear: 1997,
      status: 'Available',
      coverUrl: 'https://images.unsplash.com/photo-1621351183012-e2f6d0f387c5?w=300&h=450&fit=crop'
    }
  ];

  filteredBooks: Book[] = [...this.books];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']) {
      this.filterBooks();
    }
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
    // Add your logic here
  }
}