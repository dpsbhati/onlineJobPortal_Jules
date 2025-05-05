import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredJobPostingComponent } from './expired-job-posting.component';

describe('ExpiredJobPostingComponent', () => {
  let component: ExpiredJobPostingComponent;
  let fixture: ComponentFixture<ExpiredJobPostingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiredJobPostingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredJobPostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
