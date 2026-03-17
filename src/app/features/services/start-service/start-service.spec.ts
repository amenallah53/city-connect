import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartService } from './start-service';

describe('StartService', () => {
  let component: StartService;
  let fixture: ComponentFixture<StartService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
