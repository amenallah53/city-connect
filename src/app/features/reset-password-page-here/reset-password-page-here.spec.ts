import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordPageHere } from './reset-password-page-here';

describe('ResetPasswordPageHere', () => {
  let component: ResetPasswordPageHere;
  let fixture: ComponentFixture<ResetPasswordPageHere>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordPageHere]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPageHere);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
