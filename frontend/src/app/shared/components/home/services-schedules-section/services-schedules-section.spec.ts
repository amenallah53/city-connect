import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesSchedulesSection } from './services-schedules-section';

describe('ServicesSchedulesSection', () => {
  let component: ServicesSchedulesSection;
  let fixture: ComponentFixture<ServicesSchedulesSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesSchedulesSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesSchedulesSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
