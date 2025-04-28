import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaDetailsComponent } from './social-media-details.component';

describe('SocialMediaDetailsComponent', () => {
  let component: SocialMediaDetailsComponent;
  let fixture: ComponentFixture<SocialMediaDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediaDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
