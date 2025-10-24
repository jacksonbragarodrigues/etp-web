import { TestBed } from '@angular/core/testing';

import { GestaoFormularioService } from './gestao-formulario.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('GestaoFormularioServiceService', () => {
  let service: GestaoFormularioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GestaoFormularioService],
    });
    service = TestBed.inject(GestaoFormularioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getFormularioById', async () => {
    const id = 10;
    const mockData: any = {};
    service.getFormularioById(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getFormularioTodasVersoes', async () => {
    const id = 10;
    const mockData: any = {};
    service.getFormularioTodasVersoes(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/todas-versoes/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getTodosFormularios', async () => {
    const mockData: any = {};
    service.getTodosFormularios().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/lista`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getFormulariosPublicados', async () => {
    const mockData: any = {};
    service.getFormulariosPublicados().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/lista/publicados`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getFormulario', async () => {
    const objParams = {
      page: 0,
      size: 10,
      sort: 'desc',
      assunto: 'teste',
      ultimaVersao: 1,
    };
    const mockData: any = {};
    service.getFormulario(objParams).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario?page=${objParams.page}&size=${objParams.size}&sort=${objParams.sort}&assunto=${objParams.assunto}&ultimaVersao=${objParams.ultimaVersao}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar postFormulario', async () => {
    const objFormulario = {
      id: 1,
      assunto: {
        id: 1,
        descricao: null,
      },
      situacao: {
        id: 1,
        descricao: null,
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: 1,
    };
    const mockData: any = {};
    service.postFormulario(objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiFormularioUrl}/formulario`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar putBloqueioFormulario', async () => {
    const id = 1;
    const objFormulario = {
      id: 1,
      assunto: {
        id: 1,
        descricao: null,
      },
      situacao: {
        id: 1,
        descricao: null,
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: 1,
    };
    const mockData: any = {};
    service.putBloqueioFormulario(id, objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/bloquear/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar putFormularioJson', async () => {
    const id = 1;
    const objFormulario = {
      id: 1,
      assunto: {
        id: 1,
        descricao: null,
      },
      situacao: {
        id: 1,
        descricao: null,
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: 1,
    };
    const mockData: any = {};
    service.putFormularioJson(id, objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/json/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar patchFormulario', async () => {
    const id = 1;
    const acaoSituacao = 'teste';
    const mockData: any = {};
    service.patchFormulario(id, acaoSituacao).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PATCH');
  });

  it('deve executar putFormulario', async () => {
    const id = 1;
    const objFormulario = {
      id: 1,
      assunto: {
        id: 1,
        descricao: null,
      },
      situacao: {
        id: 1,
        descricao: null,
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: 1,
    };
    const mockData: any = {};
    service.putFormulario(id, objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar deleteFormulario', async () => {
    const id = 1;

    const mockData: any = {};
    service.deleteFormulario(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('DELETE');
  });

  it('deve executar postCopiarFormulario', async () => {
    const id = 1;

    const mockData: any = {};
    service.copiarFormulario(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/copiar/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar postVersionarFormulario', async () => {
    const id = 1;

    const mockData: any = {};
    service.versionarFormulario(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/formulario/versionar/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });
});
