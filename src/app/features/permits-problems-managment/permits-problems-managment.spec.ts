import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitsProblemsManagment } from './permits-problems-managment';

describe('PermitsProblemsManagment', () => {
  let component: PermitsProblemsManagment;
  let fixture: ComponentFixture<PermitsProblemsManagment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermitsProblemsManagment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermitsProblemsManagment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
