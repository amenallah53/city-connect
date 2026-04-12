import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyServicesSection } from './key-services-section';

describe('KeyServicesSection', () => {
  let component: KeyServicesSection;
  let fixture: ComponentFixture<KeyServicesSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyServicesSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyServicesSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
