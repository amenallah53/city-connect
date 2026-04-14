import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSchedule } from './service-schedule';

describe('ServiceSchedule', () => {
  let component: ServiceSchedule;
  let fixture: ComponentFixture<ServiceSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
