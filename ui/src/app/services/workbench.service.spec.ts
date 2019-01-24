import { TestBed } from '@angular/core/testing';

import { WorkbenchService } from './workbench.service';

describe('WorkbenchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkbenchService = TestBed.get(WorkbenchService);
    expect(service).toBeTruthy();
  });
});
