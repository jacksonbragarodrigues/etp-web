import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { EtpUnidadeAnaliseService } from './etp-unidade-analise.service';

describe('EtpUnidadeAnaliseService', () => {
  let service: EtpUnidadeAnaliseService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiFormulario}/unidades-analise`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EtpUnidadeAnaliseService],
    });
    service = TestBed.inject(EtpUnidadeAnaliseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve fazer GET getUnidadeAnalise com params', () => {
    const params = { key: 'value' };
    service.getUnidadeAnalise(params).subscribe();
    const req = httpMock.expectOne(
      (r) => r.method === 'GET' && r.url === apiUrl
    );
    expect(req.request.params.get('key')).toBe('value');
    req.flush({});
  });

  it('deve fazer GET getUnidadeAnalisePorTipoContratacao', () => {
    service.getUnidadeAnalisePorTipoContratacao(123).subscribe();
    const req = httpMock.expectOne(
      `${apiUrl}/unidade-analise-tipo-licitacao/123`
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve fazer GET getAllUnidadeAnalise', () => {
    service.getAllUnidadeAnalise().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/lista`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve fazer POST postUnidadeAnalise', () => {
    const body = { id: 1 };
    service.postUnidadeAnalise(body).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('deve fazer PUT putUnidadeAnalise', () => {
    const body = { nome: 'teste' };
    service.putUnidadeAnalise(10, body).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/10`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('deve fazer DELETE deleteUnidadeAnalise', () => {
    service.deleteUnidadeAnalise(99).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/99`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
