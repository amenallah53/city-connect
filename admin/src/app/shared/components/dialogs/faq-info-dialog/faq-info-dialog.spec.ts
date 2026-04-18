import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqInfoDialog } from './faq-info-dialog';

describe('FaqInfoDialog', () => {
  let component: FaqInfoDialog;
  let fixture: ComponentFixture<FaqInfoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqInfoDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqInfoDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
