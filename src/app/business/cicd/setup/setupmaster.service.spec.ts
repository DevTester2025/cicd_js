import { TestBed, inject } from '@angular/core/testing';

import { SetupmasterService } from './setupmaster.service';

describe('SetupmasterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SetupmasterService]
    });
  });

  it('should be created', inject([SetupmasterService], (service: SetupmasterService) => {
    expect(service).toBeTruthy();
  }));
});
