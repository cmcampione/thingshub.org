import { TestBed } from '@angular/core/testing';

import { RealTimeConnectorService } from './real-time-connector.service';

describe('RealTimeConnectorService', () => {
  let service: RealTimeConnectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealTimeConnectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
