import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintFormDialog } from './complaint-form-dialog';

describe('ComplaintFormDialog', () => {
  let component: ComplaintFormDialog;
  let fixture: ComponentFixture<ComplaintFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
