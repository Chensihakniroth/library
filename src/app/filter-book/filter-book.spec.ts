import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBook } from './filter-book';

describe('FilterBook', () => {
  let component: FilterBook;
  let fixture: ComponentFixture<FilterBook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterBook);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
