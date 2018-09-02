import { TestBed, async, inject } from '@angular/core/testing';

import { ProjectLoadGuard } from './project-load.guard';

describe('ProjectLoadGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectLoadGuard]
    });
  });

  it('should ...', inject([ProjectLoadGuard], (guard: ProjectLoadGuard) => {
    expect(guard).toBeTruthy();
  }));
});
