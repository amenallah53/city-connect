import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesOfServices } from './types-of-services';

describe('TypesOfServices', () => {
  let component: TypesOfServices;
  let fixture: ComponentFixture<TypesOfServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypesOfServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesOfServices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
