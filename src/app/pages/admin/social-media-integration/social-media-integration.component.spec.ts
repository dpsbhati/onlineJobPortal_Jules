import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaIntegrationComponent } from './social-media-integration.component';

describe('SocialMediaIntegrationComponent', () => {
  let component: SocialMediaIntegrationComponent;
  let fixture: ComponentFixture<SocialMediaIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediaIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
