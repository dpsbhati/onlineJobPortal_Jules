import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppliedApplicationsComponent } from './applied-applications.component';

describe('AppliedApplicationsComponent', () => {
  let component: AppliedApplicationsComponent;
  let fixture: ComponentFixture<AppliedApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppliedApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppliedApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
