import { TestBed } from '@angular/core/testing';

import { MillingServiceService } from './milling.service';

describe('MillingServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MillingServiceService = TestBed.get(MillingServiceService);
    expect(service).toBeTruthy();
  });
});
