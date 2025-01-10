import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantAppliedListComponent } from './applicant-applied-list.component';

describe('ApplicantAppliedListComponent', () => {
  let component: ApplicantAppliedListComponent;
  let fixture: ComponentFixture<ApplicantAppliedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantAppliedListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantAppliedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
