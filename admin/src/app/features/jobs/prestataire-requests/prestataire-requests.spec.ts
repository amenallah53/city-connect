import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireRequests } from './prestataire-requests';

describe('PrestataireRequests', () => {
  let component: PrestataireRequests;
  let fixture: ComponentFixture<PrestataireRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestataireRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
