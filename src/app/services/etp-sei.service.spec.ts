import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EtpSeiService } from './etp-sei.service';

describe('EtpSeiService', () => {
  let service: EtpSeiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EtpSeiService],
    });
    service = TestBed.inject(EtpSeiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getListaEtpSeiPorEtp', async () => {
    const mockData: any = {};
    const idEtp = 1;
    service.getListaEtpSeiPorEtp(idEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpSeiUrl}/etpsei/lista/${idEtp}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });
});
