import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMyReports } from './all-my-reports';

describe('AllMyReports', () => {
  let component: AllMyReports;
  let fixture: ComponentFixture<AllMyReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllMyReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllMyReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
