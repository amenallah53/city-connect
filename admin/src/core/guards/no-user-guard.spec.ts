import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { noUserGuard } from './no-user-guard';

describe('noUserGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => noUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
