import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VersionCheckService } from './version-check.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('VersionCheckService', () => {
  let service: VersionCheckService;
  let httpMock: HttpTestingController;
  const storageKey = 'appBuildHash';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VersionCheckService]
    });

    service = TestBed.inject(VersionCheckService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should store hash if no hash is saved', fakeAsync(() => {
    service.versionCheck();

    const req = httpMock.expectOne((r) => r.url.includes('assets/version.json'));
    expect(req.request.method).toBe('GET');
    req.flush({ version: '12345' });

    tick();

    expect(localStorage.getItem(storageKey)).toBe('12345');
  }));

  it('should call showUpdateNotification if hash is different', fakeAsync(() => {
    localStorage.setItem(storageKey, 'oldhash');
    spyOn<any>(service, 'showUpdateNotification');

    service.versionCheck();

    const req = httpMock.expectOne((r) => r.url.includes('assets/version.json'));
    req.flush({ version: 'newhash' });

    tick();

    expect(service['showUpdateNotification']).toHaveBeenCalledWith('newhash');
    expect(localStorage.getItem(storageKey)).toBe('oldhash');
  }));

  it('should not call showUpdateNotification if hash is the same', fakeAsync(() => {
    localStorage.setItem(storageKey, 'samehash');
    spyOn<any>(service, 'showUpdateNotification');

    service.versionCheck();

    const req = httpMock.expectOne((r) => r.url.includes('assets/version.json'));
    req.flush({ version: 'samehash' });

    tick();

    expect(service['showUpdateNotification']).not.toHaveBeenCalled();
  }));

  it('should handle fetchLatestHash error and return empty string', fakeAsync(() => {
    let result: string | undefined;

    service['fetchLatestHash']().then((res) => result = res);

    const req = httpMock.expectOne((r) => r.url.includes('assets/version.json'));
    req.error(new ErrorEvent('Network error'));

    tick();

    expect(result).toBe('');
  }));

  it('should dispatch version:changed event on showUpdateNotification', () => {
    const spy = jasmine.createSpy('eventSpy');
    document.addEventListener('version:changed', spy);

    service['showUpdateNotification']('abc123');

    expect(localStorage.getItem(storageKey)).toBe('abc123');
    expect(spy).toHaveBeenCalled();
  });
});
