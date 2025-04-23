import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopmentPageComponent } from './development-page.component';

describe('DevelopmentPageComponent', () => {
  let component: DevelopmentPageComponent;
  let fixture: ComponentFixture<DevelopmentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopmentPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevelopmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
