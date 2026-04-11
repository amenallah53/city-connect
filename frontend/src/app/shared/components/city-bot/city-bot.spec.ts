import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityBot } from './city-bot';

describe('CityBot', () => {
  let component: CityBot;
  let fixture: ComponentFixture<CityBot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityBot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityBot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
