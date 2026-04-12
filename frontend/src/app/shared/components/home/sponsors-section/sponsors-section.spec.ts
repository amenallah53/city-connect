import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorsSection } from './sponsors-section';

describe('SponsorsSection', () => {
  let component: SponsorsSection;
  let fixture: ComponentFixture<SponsorsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsorsSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
