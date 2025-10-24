import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { ErrorService } from './error.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ErrorService', () => {
  let service: ErrorService;
  let mockError: HttpErrorResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ErrorService],
    });
    service = TestBed.inject(ErrorService);

    // Criando um mock de HttpErrorResponse para usar nos testes
    mockError = new HttpErrorResponse({
      error: 'test-error',
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setInterceptedError should store error', () => {
    service.setInterceptedError(mockError);
    expect(service.getInterceptedError()).toEqual(mockError);
  });

  it('getInterceptedError should return the current error', () => {
    service.setInterceptedError(mockError);
    const error = service.getInterceptedError();
    expect(error).toBe(mockError);
  });

  it('resetInterceptedError should clear the stored error', () => {
    service.setInterceptedError(mockError);
    service.resetInterceptedError();
    expect(service.getInterceptedError()).toBeNull();
  });
});
