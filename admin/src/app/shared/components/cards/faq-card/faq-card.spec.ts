import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqCard } from './faq-card';

describe('FaqCard', () => {
  let component: FaqCard;
  let fixture: ComponentFixture<FaqCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
