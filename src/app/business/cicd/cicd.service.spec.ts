import { TestBed, inject } from '@angular/core/testing';

import { CicdService } from './cicd.service';

describe('CicdService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CicdService]
    });
  });

  it('should be created', inject([CicdService], (service: CicdService) => {
    expect(service).toBeTruthy();
  }));
});
