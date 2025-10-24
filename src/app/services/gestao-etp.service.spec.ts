/* tslint:disable:no-unused-variable */

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GestaoEtpService } from './gestao-etp.service';

describe('GestaoEtpService', () => {
  let service: GestaoEtpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GestaoEtpService],
    });
    service = TestBed.inject(GestaoEtpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getEtp', async () => {
    const objParams = {
      page: 0,
      size: 10,
      sort: 'desc',
      assunto: 'teste',
      ultimaVersao: 1,
    };
    const mockData: any = {};
    service.getEtp(objParams).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/listar`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar postEtp', async () => {
    const objEtp = {
      id: 1,
      formulario: 1,
      tipoLicitacao: 1,
      situacao: 1,
      descricao: 'teste',
      jsonDados: {},
      etpPai: undefined,
      versao: 1,
    };
    const mockData: any = {};
    service.postEtp(objEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar patchEtp', async () => {
    const id = 1;
    const acaoSituacao = 'teste';
    const mockData: any = {};
    service.patchEtp(id, acaoSituacao).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('PATCH');
  });

  it('deve executar putEtp', async () => {
    const id = 1;
    const objEtp = {
      id: 1,
      formulario: 1,
      tipoLicitacao: 1,
      situacao: 1,
      descricao: 'teste',
      jsonDados: {},
      etpPai: undefined,
      versao: 1,
    };
    const mockData: any = {};
    service.putEtp(id, objEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar deleteEtp', async () => {
    const id = 1;

    const mockData: any = {};
    service.deleteEtp(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('DELETE');
  });

  it('deve executar postCopiarEtp', async () => {
    const id = 1;

    const mockData: any = {};
    service.copiarEtp(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/copiar/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar postVersionarEtp', async () => {
    const id = 1;

    const mockData: any = {};
    service.versionarEtp(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/versionar/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });
});
