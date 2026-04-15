import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireFormDialog } from './prestataire-form-dialog';

describe('PrestataireFormDialog', () => {
  let component: PrestataireFormDialog;
  let fixture: ComponentFixture<PrestataireFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestataireFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
