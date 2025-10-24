/* tslint:disable:no-unused-variable */

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Sarhclientservice } from './sarhclient.service';

describe('Sarhclientservice', () => {
  let service: Sarhclientservice;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Sarhclientservice],
    });
    service = TestBed.inject(Sarhclientservice);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getEtp', async () => {
    const mockData: any = {};
    service.getListaUnidades().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiSarhClientUrl}/listaunidades?limit=100000`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });
});
