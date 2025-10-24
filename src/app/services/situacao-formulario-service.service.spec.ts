import { TestBed } from '@angular/core/testing';

import { SituacaoFormularioServiceService } from './situacao-formulario-service.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('SituacaoFormularioServiceService', () => {
  let service: SituacaoFormularioServiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SituacaoFormularioServiceService],
    });
    service = TestBed.inject(SituacaoFormularioServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getSituacaoFormulario', async () => {
    const mockData: any = [];
    service.getSituacaoFormulario().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/situacao/lista`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getSituacao', async () => {
    const objParams = {
      page: 0,
      size: 10,
      sort: 'desc',
    };
    const mockData: any = {};
    service.getSituacao(objParams).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/situacao?page=${objParams.page}&size=${objParams.size}&sort=${objParams.sort}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar postSituacao', async () => {
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.postSituacao(objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiFormularioUrl}/situacao`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar putSituacao', async () => {
    const id = 1;
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.putSituacao(id, objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/situacao/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar deleteSituacao', async () => {
    const id = 1;

    const mockData: any = {};
    service.deleteSituacao(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/situacao/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('DELETE');
  });
});
