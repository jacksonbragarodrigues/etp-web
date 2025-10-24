import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PessoalExternoService } from './pessoal-externo.service';


describe('PessoalExternoService', () => {
  let service: PessoalExternoService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PessoalExternoService
      ]
    });
    service = TestBed.inject(PessoalExternoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar getDadosPessoalExternaByNome()', () => {
    const mock: any = [];
    let nome: string = 'Ana';
    service.getDadosPessoalExternaByNome(nome).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiPessoaExternaUrl}/nome/${nome}`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('GET');
  });

  it('deve executar getDadosPessoalExternaByNickName()', () => {
    const mock: any = [];
    let nickName: string = 'Ana';
    service.getDadosPessoalExternaByDescricaoNickName(nickName).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiPessoaExternaUrl}/descricaoNickName/${nickName}`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('GET');
  });

  it('deve executar getDadosPessoalExternaBycpf()', () => {
    const mock: any = [];
    let cpf: string = 'Ana';
    service.getDadosPessoalExternaBycpf(cpf).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiPessoaExternaUrl}/cpf/${cpf}`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('GET');
  });

  it('deve executar getDadosPessoalExternaFilter()', () => {
    const mock: any = [];
    const objParams = {};
    service.getDadosPessoalExternaFilter(objParams).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiPessoaExternaUrl}`, `${objParams}`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('GET');
  });

  it('deve executar postPessoalExterno()', () => {
    const mock: any = {};
    const objParams: any = {};
    service.postPessoalExterno(objParams).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiPessoaExternaUrl}`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('POST');
  });

  it('deve executar putPessoalExterno()', () => {
    const mock: any = [];
    const id = 1;
    const objParams = {};
    service.putPessoalExterno(id, objParams).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiPessoaExternaUrl}/id/${id}`, `${objParams}`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('PUT');
  });

  it('deve executar deletePessoalExterno()', () => {
    const mock: any = [];
    const id = 1;
    service.deletePessoalExterno(id).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiPessoaExternaUrl}/id/${id}`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('DELETE');
  });

  it('deve executar getDadosPessoalExterna()', () => {
    const mock: any = [];
    const nome = 'Ivan';
    service.getDadosPessoalExterna(nome).subscribe((data) =>{
      expect(data).toEqual(mock);
    });
    const resultado = httpMock.expectOne(`${service.apiPessoaExternaUrl}/nome/${nome}`);
    resultado.flush(mock);
    expect(resultado.request.method).toBe('GET');
  });

});
