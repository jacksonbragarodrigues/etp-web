import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UnidadeService } from './uniade-service.service';

describe('TabelasServiceService', () => {
  let service: UnidadeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UnidadeService,
      ],
    });
    service = TestBed.inject(UnidadeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('shold run #getUnidade()', async () => {
    const indAtribuicaoUnidade = '';
    const mockData: any = [];
    service.getUnidade(indAtribuicaoUnidade).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiUnidadeUrl}/unidades/busca-unidade-por-atribuicao/${indAtribuicaoUnidade}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET')
  });

  it('deve executar getUnidadeExterna()', () => {
    const mock: any = [];
    let cpf: any = 11111111111;
    service.getUnidadeExterna(cpf).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiUnidadeUrl}/unidade/unidade-externa/cpf/${cpf}/`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('GET');
  });

});
