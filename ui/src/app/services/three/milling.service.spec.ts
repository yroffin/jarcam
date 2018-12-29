import { TestBed } from '@angular/core/testing';

import { MillingService } from './milling.service';

describe('MillingServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MillingService = TestBed.get(MillingService);
    expect(service).toBeTruthy();
  });
});
