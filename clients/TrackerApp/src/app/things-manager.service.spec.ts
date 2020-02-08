import { TestBed } from '@angular/core/testing';

import { ThingsManagerService } from './things-manager.service';

describe('ThingsManagerService', () => {
  let service: ThingsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThingsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
