import { TestBed } from '@angular/core/testing';

import { StlLoaderService } from './stl-loader.service';

describe('StlLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StlLoaderService = TestBed.get(StlLoaderService);
    expect(service).toBeTruthy();
  });
});
