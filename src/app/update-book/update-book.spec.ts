import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBook } from './update-book';

describe('UpdateBook', () => {
  let component: UpdateBook;
  let fixture: ComponentFixture<UpdateBook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBook);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
