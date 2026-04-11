import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginProjetDescrip } from './login-projet-descrip';

describe('LoginProjetDescrip', () => {
  let component: LoginProjetDescrip;
  let fixture: ComponentFixture<LoginProjetDescrip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginProjetDescrip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginProjetDescrip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
