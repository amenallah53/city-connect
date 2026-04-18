import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceFormDialog } from './service-form-dialog';

describe('ServiceFormDialog', () => {
  let component: ServiceFormDialog;
  let fixture: ComponentFixture<ServiceFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
