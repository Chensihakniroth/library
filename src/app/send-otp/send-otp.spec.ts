import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendOtp } from './send-otp';

describe('SendOtp', () => {
  let component: SendOtp;
  let fixture: ComponentFixture<SendOtp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendOtp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendOtp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
