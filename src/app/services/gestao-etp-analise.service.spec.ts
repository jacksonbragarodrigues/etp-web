/* tslint:disable:no-unused-variable */

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GestaoEtpAnaliseService } from './gestao-etp-analise.service';

describe('GestaoEtpAnaliseService', () => {
  let service: GestaoEtpAnaliseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GestaoEtpAnaliseService],
    });
    service = TestBed.inject(GestaoEtpAnaliseService);
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
    service.getEtpAnalise(objParams).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/listar`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar getEtpAnaliseTodasVersoes', async () => {
    const id = 1;
    const mockData: any = {};
    service.getEtpAnaliseTodasVersoes(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpUrl}/todas-versoes/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getLogsEtpAnalise', async () => {
    const id = 1;
    const mockData: any = {};
    service.getLogsEtpAnalise(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/buscarLogs/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getEtpAnaliseById', async () => {
    const id = 1;
    const mockData: any = {};
    service.getEtpAnaliseById(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getEtpAnaliseLista', async () => {
    const mockData: any = {};
    service.getEtpAnaliseLista().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/lista`);
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getDadosServidorLogado', async () => {
    const mockData: any = {};
    service.getDadosServidorLogado().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/dados-servidor`);
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getTodasVersoesEtp', async () => {
    const id = 1;
    const objEtp = {
      id: 1,
    };
    const mockData: any = {};
    service.getTodasVersoesEtp(id, objEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/versoes/1?id=1`);
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getEtpAnaliseListaBloqueados', async () => {
    const mockData: any = {};
    service.getEtpAnaliseListaBloqueados().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/bloqueados`);
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar consultarDadosServidorPorLoginEtpAnalise', async () => {
    const mockData: any = {};
    service.consultarDadosServidorPorLoginEtpAnalise().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/lista/servidores`);
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
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
    service.postEtpAnalise(objEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar postBloquearAnaliseEtpAnalise', async () => {
    const idEtp = 1;
    const acao = 'Teste';
    const mockData: any = {};
    service.postBloquearAnaliseEtpAnalise(idEtp, acao).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpUrl}/bloquearanalise/${idEtp}/${acao}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar patchEtp', async () => {
    const id = 1;
    const acaoSituacao = 'teste';
    const mockData: any = {};
    service.patchEtpAnalise(id, acaoSituacao).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('PATCH');
  });

  it('deve executar alteraEtpEtapaAnalise', async () => {
    const id = 1;
    const acaoSituacao = 'teste';
    const mockData: any = {};
    service.alteraEtpEtapaAnalise(id, acaoSituacao).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/altera-etapa/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('PATCH');
  });

  it('deve executar patchEtp', async () => {
    const id = 1;
    const acaoSituacao = 'teste';
    const mockData: any = {};
    service.patchNextEtpAnalise(id, acaoSituacao).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/next/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('PATCH');
  });

  it('deve executar patchFormularioEtpAnalise', async () => {
    const id = 1;
    const idFormulario = 2;
    const mockData: any = {};
    service.patchFormularioEtpAnalise(id, idFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/formulario/${id}`);
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
    service.putEtpAnalise(id, objEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar putBloqueioEtpAnalise', async () => {
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
    service.putBloqueioEtpAnalise(id, objEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/bloquear/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar putDadosEtpAnalise', async () => {
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
    service.putDadosEtpAnalise(id, objEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/json/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar deleteEtp', async () => {
    const id = 1;

    const mockData: any = {};
    service.deleteEtpAnalise(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('DELETE');
  });

  it('deve executar postCopiarEtp', async () => {
    const id = 1;

    const mockData: any = {};
    service.copiarEtpAnalise(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/copiar/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar postVersionarEtp', async () => {
    const id = 1;

    const mockData: any = {};
    service.versionarEtpAnalise(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiEtpUrl}/versionar/${id}`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });
});
