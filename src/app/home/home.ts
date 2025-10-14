import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterBook } from '../filter-book/filter-book';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule, FilterBook],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  selectedFilter: string = 'default';
  searchQuery: string = '';

  // Sample books data for default view
  allBooks = [
    {
      title: 'Don\'t Make Me think',
      author: 'Steve Krug',
      year: 2000,
      rating: 40,
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop'
    },
    {
      title: 'The Design of Every...',
      author: 'Don Norman',
      year: 1988,
      rating: 40,
      cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=450&fit=crop'
    },
    {
      title: 'Sprint : How to solve...',
      author: 'Jake Knapp',
      year: 2000,
      rating: 40,
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'
    },
    {
      title: 'Lean UX : Design Gr...',
      author: 'Jeff Gothelf',
      year: 2016,
      rating: 40,
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'
    },
    {
      title: 'The Road to React',
      author: 'Steve Krug',
      year: 2000,
      rating: 40,
      cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=450&fit=crop'
    },
    {
      title: 'Rich Dad Poor Dad',
      author: 'Robert T Kiyosaki',
      year: 1997,
      rating: 40,
      cover: 'https://images.unsplash.com/photo-1621351183012-e2f6d0f387c5?w=300&h=450&fit=crop'
    },
    {
      title: 'Harry Potter and The...',
      author: 'J.K. Rowling',
      year: 2002,
      rating: 40,
      cover: 'https://images.unsplash.com/photo-1621351183012-e2f6d0f387c5?w=300&h=450&fit=crop'
    },
    {
      title: 'You Don\'t Know JS: S...',
      author: 'Kyle Simpson',
      year: 2014,
      rating: 40,
      cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop'
    }
  ];

  get hasData(): boolean {
    return this.selectedFilter !== 'onshelf';
  }

  get filteredBooks() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.allBooks;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.allBooks.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  }

  onFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedFilter = selectElement.value;
  }

  onAddBook(): void {
    console.log('Add new book');
    // Add your logic here
  }
}