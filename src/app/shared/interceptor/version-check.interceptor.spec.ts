import {
  HttpEvent,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { VersionCheckService } from 'src/utils/version-check.service';
import { VersionCheckInterceptor } from './version-check.interceptor';

describe('VersionCheckInterceptor', () => {
  let versionCheckServiceSpy: jasmine.SpyObj<VersionCheckService>;
  let interceptor: VersionCheckInterceptor;
  let mockHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    versionCheckServiceSpy = jasmine.createSpyObj('VersionCheckService', ['versionCheck']);
    mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);

    TestBed.configureTestingModule({
      providers: [
        VersionCheckInterceptor,
        { provide: VersionCheckService, useValue: versionCheckServiceSpy }
      ]
    });

    interceptor = TestBed.inject(VersionCheckInterceptor);
    mockHandler.handle.and.returnValue(of({} as HttpEvent<any>));
  });

  it('should call versionCheck when the URL does not include assets/version.json', () => {
    const req = new HttpRequest('GET', '/api/data');
    interceptor.intercept(req, mockHandler);
    expect(versionCheckServiceSpy.versionCheck).toHaveBeenCalled();
    expect(mockHandler.handle).toHaveBeenCalledWith(req);
  });

  it('should NOT call versionCheck when the URL includes assets/version.json', () => {
    const req = new HttpRequest('GET', '/assets/version.json');
    interceptor.intercept(req, mockHandler);
    expect(versionCheckServiceSpy.versionCheck).not.toHaveBeenCalled();
    expect(mockHandler.handle).toHaveBeenCalledWith(req);
  });
});
