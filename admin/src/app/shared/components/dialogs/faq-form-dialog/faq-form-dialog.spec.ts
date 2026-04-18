import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqFormDialog } from './faq-form-dialog';

describe('FaqFormDialog', () => {
  let component: FaqFormDialog;
  let fixture: ComponentFixture<FaqFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
