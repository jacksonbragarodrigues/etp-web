import { TestBed } from '@angular/core/testing';

import { RotulosFormularioService } from './rotulos-formulario-service.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('RotulosFormularioServiceService', () => {
  let service: RotulosFormularioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RotulosFormularioService],
    });
    service = TestBed.inject(RotulosFormularioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getRotulosFormulario', async () => {
    const mockData: any = [];
    service.getRotulosFormulario().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/rotulos/lista`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar getRotulos', async () => {
    const objParams = {
      page: 0,
      size: 10,
      sort: 'desc',
    };
    const mockData: any = {};
    service.getRotulos(objParams).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/rotulos?page=${objParams.page}&size=${objParams.size}&sort=${objParams.sort}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve executar postRotulos', async () => {
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.postRotulos(objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(`${service.apiFormularioUrl}/rotulos`);
    result.flush(mockData);
    expect(result.request.method).toBe('POST');
  });

  it('deve executar putRotulos', async () => {
    const id = 1;
    const objFormulario = {
      id: 1,
      descricao: 'teste',
    };
    const mockData: any = {};
    service.putRotulos(id, objFormulario).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/rotulos/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('PUT');
  });

  it('deve executar deleteRotulos', async () => {
    const id = 1;

    const mockData: any = {};
    service.deleteRotulos(id).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiFormularioUrl}/rotulos/${id}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('DELETE');
  });
});
