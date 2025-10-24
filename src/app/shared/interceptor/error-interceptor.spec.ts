import { TestBed } from '@angular/core/testing';
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { ErrorService } from '../service/error.service';
import { ErrorInterceptor } from './error-interceptor';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class MockHttpHandler extends HttpHandler {
  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    return of({} as any);
  }
}

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let errorService: ErrorService;
  let router: Router;

  beforeEach(() => {
    const routerMock = {
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ErrorInterceptor,
        { provide: Router, useValue: routerMock },
        { provide: ErrorService, useClass: ErrorService },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      ],
    });

    interceptor = TestBed.inject(ErrorInterceptor);
    errorService = TestBed.inject(ErrorService);
    router = TestBed.inject(Router);
  });

  it('should pass through non-error responses', () => {
    const next: HttpHandler = {
      handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
        return of(new HttpResponse({ status: 200 }));
      },
    };

    const httpRequest = new HttpRequest('GET', '/test');
    interceptor.intercept(httpRequest, next).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(errorService.getInterceptedError()).toBeNull();
    });
  });

  it('should redirect to access denied on 403 error and set intercepted error', () => {
    const next: HttpHandler = {
      handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
        return throwError(
          () =>
            new HttpErrorResponse({
              error: 'test-error',
              status: 403,
              statusText: 'Forbidden',
              url: request.url, // Assegurar que a URL é conhecida para a resposta de erro
            })
        );
      },
    };

    const httpRequest = new HttpRequest('GET', '/test');
    interceptor.intercept(httpRequest, next).subscribe({
      next: (response) => {},
      error: (error) => {
        expect(router.navigateByUrl).toHaveBeenCalledWith('/acesso-negado');
        expect(errorService.getInterceptedError()).toEqual(
          jasmine.objectContaining({
            status: 403,
            statusText: 'Forbidden',
            error: 'test-error', // Verificar o objeto de erro real, incluindo a propriedade 'error'
          })
        );
        expect(error.message).toContain('403 Forbidden'); // Verificar se a mensagem inclui a parte esperada
      },
    });
  });
});
