import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ErrorService } from '../shared/service/error.service';
import { ErrorHandleGuard } from './error-handle.guard';

describe('ErrorHandleGuard', () => {
  let guard: ErrorHandleGuard;
  let router: Router;
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ErrorHandleGuard,
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigateByUrl']),
        },
        {
          provide: ErrorService,
        },
      ],
    });
    guard = TestBed.inject(ErrorHandleGuard);
    router = TestBed.inject(Router);
    errorService = TestBed.inject(ErrorService);
  });

  it('deve bloquear a navegação e redirecionar para a página de acesso negado quando houver um erro 403', () => {
    spyOn(errorService, 'resetInterceptedError').and.returnValue({} as any);
    spyOn(errorService, 'getInterceptedError').and.returnValue({
      status: 403,
    } as HttpErrorResponse);
    const next: ActivatedRouteSnapshot = jasmine.createSpyObj(
      'ActivatedRouteSnapshot',
      ['']
    );
    const state: RouterStateSnapshot = jasmine.createSpyObj(
      'RouterStateSnapshot',
      ['']
    );
    const result = guard.canActivate(next, state);
    expect(errorService.resetInterceptedError).toHaveBeenCalled();
    if (result instanceof Observable) {
      result.subscribe((value) => {
        expect(value).toEqual(false);
        expect(router.navigateByUrl).toHaveBeenCalledWith('/acesso-negado');
      });
    }
  });

  it('deve permitir a navegação se não houver erro', () => {
    spyOn(errorService, 'getInterceptedError').and.returnValue(null);
    const next: ActivatedRouteSnapshot = jasmine.createSpyObj(
      'ActivatedRouteSnapshot',
      ['']
    );
    const state: RouterStateSnapshot = jasmine.createSpyObj(
      'RouterStateSnapshot',
      ['']
    );
    const result = guard.canActivate(next, state);
    if (result instanceof Observable) {
      result.subscribe((value) => {
        expect(value).toEqual(true);
      });
    }
  });
});
