import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintInfoDialog } from './complaint-info-dialog';

describe('ComplaintInfoDialog', () => {
  let component: ComplaintInfoDialog;
  let fixture: ComponentFixture<ComplaintInfoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintInfoDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintInfoDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
