import { TestBed } from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { EtpEtapaService } from './etp-etapa-service.service';

describe('EtpEtapaService', () => {
  let service: EtpEtapaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EtpEtapaService],
    });
    service = TestBed.inject(EtpEtapaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getEtpEtapaLista', async () => {
    const mockData: any = [];
    service.getEtpEtapaLista().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-etapa/lista`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getEtpEtapa', async () => {
    const objParams = {
      page: 0,
      size: 10,
      sort: 'desc',
    };
    const mockData: any = {};
    service.getEtpEtapa(objParams).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-etapa?page=${objParams.page}&size=${objParams.size}&sort=${objParams.sort}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar postEtpEtapa', async () => {
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.postEtpEtapa(objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiFormularioUrl}/etp-etapa`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar putEtpEtapa', async () => {
    const id = 1;
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.putEtpEtapa(id, objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-etapa/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar deleteEtpEtapa', async () => {
    const id = 1;

    const mockData: any = {};
    service.deleteEtpEtapa(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-etapa/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('DELETE');
  });
});
