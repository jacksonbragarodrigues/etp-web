import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EtpEnvioSeiService } from './etp-envio-sei.service';

describe('EtpEnvioSeiService', () => {
  let service: EtpEnvioSeiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EtpEnvioSeiService],
    });
    service = TestBed.inject(EtpEnvioSeiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar enviarSei', async () => {
    const mockData: any = {};
    service.enviarSei(mockData).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.etpEnvioSeiUrl}/etpenviosei/enviaretp`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar enviarFormularioSei', async () => {
    const mockData: any = {};
    service.enviarFormularioSei(mockData).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.etpEnvioSeiUrl}/etpenviosei/enviarformulario`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });
});
