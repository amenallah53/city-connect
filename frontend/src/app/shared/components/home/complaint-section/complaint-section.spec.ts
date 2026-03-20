import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintSection } from './complaint-section';

describe('ComplaintSection', () => {
  let component: ComplaintSection;
  let fixture: ComponentFixture<ComplaintSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
