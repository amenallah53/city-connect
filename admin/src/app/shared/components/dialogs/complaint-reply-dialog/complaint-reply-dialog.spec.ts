import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintReplyDialog } from './complaint-reply-dialog';

describe('ComplaintReplyDialog', () => {
  let component: ComplaintReplyDialog;
  let fixture: ComponentFixture<ComplaintReplyDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintReplyDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintReplyDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
