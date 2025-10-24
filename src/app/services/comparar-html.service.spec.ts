import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CompararHtmlservice } from './comparar-html.service';

describe('Sarhclientservice', () => {
  let service: CompararHtmlservice;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompararHtmlservice],
    });
    service = TestBed.inject(CompararHtmlservice);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getEtp', async () => {
    const mockData: any = {};
    service.compararVersaoHtml(1, 2, true, false).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiCompararHtmlUrl}/versoes/comparar`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });
});
