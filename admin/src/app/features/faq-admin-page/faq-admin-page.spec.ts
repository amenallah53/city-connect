import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqAdminPage } from './faq-admin-page';

describe('FaqAdminPage', () => {
  let component: FaqAdminPage;
  let fixture: ComponentFixture<FaqAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqAdminPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqAdminPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
