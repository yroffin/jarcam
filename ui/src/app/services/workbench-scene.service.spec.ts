import { TestBed } from '@angular/core/testing';

import { WorkbenchSceneService } from './workbench-scene.service';

describe('WorkbenchSceneService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkbenchSceneService = TestBed.get(WorkbenchSceneService);
    expect(service).toBeTruthy();
  });
});
