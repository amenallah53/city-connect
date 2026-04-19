import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { NewsSection } from './news-section';

describe('NewsSection', () => {
  let component: NewsSection;
  let fixture: ComponentFixture<NewsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsSection],
      providers: [provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
