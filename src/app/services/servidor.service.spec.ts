import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ServidorService } from './servidor.service';


describe('ServidorService', () => {
  let service: ServidorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ServidorService
      ]
    });
    service = TestBed.inject(ServidorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getDadosServidor()', async () => {
    const nome = 'ana';
    const mockData: any = [];
    service.getDadosServidor(nome).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiDadosServidorUrl}/dados-servidor/dadosbasicosservidor/nome/${nome}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET')
  });

  it('deve executar getDadosServidorPelaMatricula()', async () => {
    const matricula = 'S01';
    const mockData: any = [];
    service.getDadosServidorPelaMatricula(matricula).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiDadosServidorUrl}/dados-servidor/dadosbasicosservidor/matricula/${matricula}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET')
  });

  it('deve executar getGestorTitularSubstituto()', async () => {
    const seqUnidade = 'S01';
    const mockData: any = [];
    service.getGestorTitularSubstituto(seqUnidade).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiDadosServidorUrl}/dados-servidor/dadosbasicosservidor/titularsubstituto/unidade/${seqUnidade}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET')
  });

});
