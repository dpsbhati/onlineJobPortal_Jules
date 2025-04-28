import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantJobComponent } from './applicant-job.component';

describe('ApplicantJobComponent', () => {
  let component: ApplicantJobComponent;
  let fixture: ComponentFixture<ApplicantJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantJobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
