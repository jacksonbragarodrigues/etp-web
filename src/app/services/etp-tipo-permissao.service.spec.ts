import { TestBed } from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { EtpTipoPermissaoService } from './etp-tipo-permissao.service';

describe('EtpTipoPermissaoService', () => {
  let service: EtpTipoPermissaoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EtpTipoPermissaoService],
    });
    service = TestBed.inject(EtpTipoPermissaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getEtpTipoPermissao', async () => {
    const mockData: any = [];
    service.getEtpTipoPermissaoList().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpTipoPermissaoUrl}/etp-tipo-permissao/lista`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getEtpTipoPermissao', async () => {
    const objParams = {
      page: 0,
      size: 10,
      sort: 'desc',
    };
    const mockData: any = {};
    service.getEtpTipoPermissao(objParams).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpTipoPermissaoUrl}/etp-tipo-permissao?page=${objParams.page}&size=${objParams.size}&sort=${objParams.sort}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar postEtpTipoPermissao', async () => {
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.postEtpTipoPermissao(objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpTipoPermissaoUrl}/etp-tipo-permissao`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar putEtpTipoPermissao', async () => {
    const id = 1;
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.putEtpTipoPermissao(id, objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpTipoPermissaoUrl}/etp-tipo-permissao/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar deleteEtpTipoPermissao', async () => {
    const id = 1;

    const mockData: any = {};
    service.deleteEtpTipoPermissao(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpTipoPermissaoUrl}/etp-tipo-permissao/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('DELETE');
  });
});
