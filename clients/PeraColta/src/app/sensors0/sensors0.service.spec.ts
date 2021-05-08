import { TestBed } from '@angular/core/testing';

import { Sensors0Service } from './sensors0.service';

describe('SensorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Sensors0Service = TestBed.get(Sensors0Service);
    expect(service).toBeTruthy();
  });
});
