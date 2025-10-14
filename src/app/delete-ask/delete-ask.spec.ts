import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAsk } from './delete-ask';

describe('DeleteAsk', () => {
  let component: DeleteAsk;
  let fixture: ComponentFixture<DeleteAsk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAsk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAsk);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
