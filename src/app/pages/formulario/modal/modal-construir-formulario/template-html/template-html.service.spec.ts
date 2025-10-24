import { TestBed } from '@angular/core/testing';
import { TemplateHtmlService } from './template-html.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

describe('TemplateHtmlService', () => {
  let service: TemplateHtmlService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = environment.apiFormulario;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TemplateHtmlService],
    });

    service = TestBed.inject(TemplateHtmlService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve chamar o endpoint correto em geradorPDF', () => {
    const dummyBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    const formularioId = 1;

    service.geradorPDF(formularioId).subscribe((response: Blob) => {
      expect(response).toEqual(dummyBlob);
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/formulario/gerador-pdf/${formularioId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyBlob);

    expect(req.request.responseType).toBe('blob');
  });

  it('deve chamar o endpoint correto em geradorPDFFormularioCompleto', () => {
    const dummyBlob = new Blob(['pdf completo'], { type: 'application/pdf' });
    const formularioId = 2;

    service.geradorPDFFormularioCompleto(formularioId).subscribe((response: Blob) => {
      expect(response).toEqual(dummyBlob);
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/formulario/gerador-pdf-completo/${formularioId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');

    req.flush(dummyBlob);
  });

  it('deve chamar o endpoint correto em geradorPDFEtp', () => {
    const dummyBlob = new Blob(['etp pdf'], { type: 'application/pdf' });
    const etpId = 3;
    const usarSigilo = true;

    service.geradorPDFEtp(etpId, usarSigilo).subscribe((response: Blob) => {
      expect(response).toEqual(dummyBlob);
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/formulario/gerador-pdf/etp/${etpId}/${usarSigilo}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');

    req.flush(dummyBlob);
  });
});
