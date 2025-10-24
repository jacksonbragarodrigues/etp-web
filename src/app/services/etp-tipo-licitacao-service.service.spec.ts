import { TestBed } from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { EtpTipoLicitacaoService } from './etp-tipo-licitacao-service.service';

describe('EtpTipoLicitacaoService', () => {
  let service: EtpTipoLicitacaoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EtpTipoLicitacaoService],
    });
    service = TestBed.inject(EtpTipoLicitacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getEtpTipoLicitacaoLista', async () => {
    const mockData: any = [];
    service.getEtpTipoLicitacaoLista().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-tipo-licitacao/lista`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getEtpTipoLicitacao', async () => {
    const objParams = {
      page: 0,
      size: 10,
      sort: 'desc',
    };
    const mockData: any = {};
    service.getEtpTipoLicitacao(objParams).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-tipo-licitacao?page=${objParams.page}&size=${objParams.size}&sort=${objParams.sort}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar postEtpTipoLicitacao', async () => {
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.postEtpTipoLicitacao(objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-tipo-licitacao`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar putEtpTipoLicitacao', async () => {
    const id = 1;
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.putEtpTipoLicitacao(id, objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-tipo-licitacao/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar deleteEtpTipoLicitacao', async () => {
    const id = 1;

    const mockData: any = {};
    service.deleteEtpTipoLicitacao(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/etp-tipo-licitacao/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('DELETE');
  });
});
