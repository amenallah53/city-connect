import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintDeleteDialog } from './complaint-delete-dialog';

describe('ComplaintDeleteDialog', () => {
  let component: ComplaintDeleteDialog;
  let fixture: ComponentFixture<ComplaintDeleteDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintDeleteDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintDeleteDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
