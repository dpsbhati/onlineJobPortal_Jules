import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantJobviewComponent } from './applicant-jobview.component';

describe('ApplicantJobviewComponent', () => {
  let component: ApplicantJobviewComponent;
  let fixture: ComponentFixture<ApplicantJobviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantJobviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantJobviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
