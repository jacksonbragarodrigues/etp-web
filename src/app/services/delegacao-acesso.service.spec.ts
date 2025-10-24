import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DelegacaoAcessoService } from './delegacao-acesso.service';
import { environment } from '../../environments/environment';

describe('DelegacaoAcessoService', () => {
  let service: DelegacaoAcessoService;
  let httpMock: HttpTestingController;
  const apiFormularioUrl = environment.apiFormulario;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DelegacaoAcessoService],
    });

    service = TestBed.inject(DelegacaoAcessoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET method and return an array of delegations', () => {
    const mockData = [{ id: 1, nome: 'Delegação 1' }];
    const id = 123;
    const delegacaoAcesso = 'admin';

    service.getDelegacaoAcesso(id, delegacaoAcesso).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${apiFormularioUrl}/delegacao-acesso/${delegacaoAcesso}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should call POST method to create a delegation', () => {
    const newDelegacao = { id: 2, nome: 'Delegação 2' };

    service.postDelegacaoAcesso(newDelegacao).subscribe((response) => {
      expect(response).toEqual(newDelegacao);
    });

    const req = httpMock.expectOne(`${apiFormularioUrl}/delegacao-acesso`);
    expect(req.request.method).toBe('POST');
    req.flush(newDelegacao);
  });

  it('should call DELETE method to remove a delegation', () => {
    const idDelegacao = 10;

    service.deleteDelegacaoAcesso(idDelegacao).subscribe((response) => {
      expect(response).toBeNull(); // DELETE geralmente retorna null ou vazio
    });

    const req = httpMock.expectOne(`${apiFormularioUrl}/delegacao-acesso/${idDelegacao}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
