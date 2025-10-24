import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormularioSeiService } from './formulario-sei.service';

describe('FormularioSeiService', () => {
  let service: FormularioSeiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FormularioSeiService],
    });
    service = TestBed.inject(FormularioSeiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getListaFormularioSeiPorFormulario', async () => {
    const mockData: any = {};
    const idEtp = 1;
    service.getListaFormularioSeiPorFormulario(idEtp).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiEtpSeiUrl}/formulariosei/lista/${idEtp}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });
});
