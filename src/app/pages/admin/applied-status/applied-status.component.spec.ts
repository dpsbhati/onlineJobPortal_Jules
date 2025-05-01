import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppliedStatusComponent } from './applied-status.component';

describe('AppliedStatusComponent', () => {
  let component: AppliedStatusComponent;
  let fixture: ComponentFixture<AppliedStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppliedStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppliedStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
