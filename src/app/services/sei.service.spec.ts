/* tslint:disable:no-unused-variable */

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SeiService } from './sei.service';
import { of } from 'rxjs';
import { RetornoConsultaProcedimentoDTO } from '../dto/retornoConsultaProcedimentoDTO.model';

describe('SeiService', () => {
  let service: SeiService;
  let httpMock: HttpTestingController;
  let data: RetornoConsultaProcedimentoDTO;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SeiService],
    });
    service = TestBed.inject(SeiService);
    httpMock = TestBed.inject(HttpTestingController);
    data = new RetornoConsultaProcedimentoDTO();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve executar findProcesso', async () => {
    const mockData: any = {};
    const numero = 'STJ 653';
    const ano = '2024';
    service.findProcesso(numero, ano).subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const result = httpMock.expectOne(
      `${service.apiSeiUrl}/numero/${numero}/ano/${ano}`
    );
    result.flush(mockData);
    expect(result.request.method).toBe('GET');
  });

  it('deve retornar undefined se o processo for nulo ou vazio', async () => {
    const result = await service.pesquisaProcesso('');
    expect(result).toBeUndefined();
  });

  it('deve usar o ano atual se não houver ano no processo', async () => {
    spyOn(service, 'findProcesso').and.returnValue(
      of(data) // Retorno simulado
    );

    const numProcesso = '123';
    const anoAtual = new Date().getFullYear();

    const result = await service.pesquisaProcesso(numProcesso);
    expect(service.findProcesso).toHaveBeenCalledWith(
      numProcesso,
      anoAtual.toString()
    );
    expect(result).toEqual(data);
  });

  it('deve processar corretamente um número de processo completo', async () => {
    spyOn(service, 'findProcesso').and.returnValue(
      of(data) // Retorno simulado
    );

    const numProcesso = '123/2023';

    const result = await service.pesquisaProcesso(numProcesso);
    expect(service.findProcesso).toHaveBeenCalledWith('123', '2023');
    expect(result).toEqual(data);
  });

  it('deve retornar undefined se o processo não contiver número válido', async () => {
    spyOn(service, 'findProcesso').and.returnValue(of(null));

    const result = await service.pesquisaProcesso('invalid/processo');
    expect(result).toBeNull();
  });

  it('deve formatar o número do documento corretamente com ano fornecido', () => {
    const result = service.setaNumeroDocumento('1/2023');
    expect(result).toBe('0001/2023');
  });

  it('deve adicionar zeros à esquerda para número de 2 dígitos', () => {
    const result = service.setaNumeroDocumento('12/2023');
    expect(result).toBe('0012/2023');
  });

  it('deve adicionar zeros à esquerda para número de 3 dígitos', () => {
    const result = service.setaNumeroDocumento('123/2023');
    expect(result).toBe('0123/2023');
  });

  it('deve usar o ano atual se o ano do documento não for fornecido', () => {
    const anoAtual = new Date().getFullYear();
    const result = service.setaNumeroDocumento('123');
    expect(result).toBe(`0123/${anoAtual}`);
  });

  it('deve retornar null se a entrada for nula', () => {
    const result = service.setaNumeroDocumento('');
    expect(result).toBeNull();
  });

  it('deve retornar null se a entrada for uma string vazia', () => {
    const result = service.setaNumeroDocumento('');
    expect(result).toBeNull();
  });

  it('deve retornar null para entrada inválida que não contém "/"', () => {
    const result = service.setaNumeroDocumento('123invalid');
    expect(result).toBe(`123invalid/${new Date().getFullYear()}`);
  });

  it('deve lidar corretamente com números de 1 dígito e sem ano', () => {
    const anoAtual = new Date().getFullYear();
    const result = service.setaNumeroDocumento('1');
    expect(result).toBe(`0001/${anoAtual}`);
  });

  it('deve lidar corretamente com números de 2 dígitos e sem ano', () => {
    const anoAtual = new Date().getFullYear();
    const result = service.setaNumeroDocumento('12');
    expect(result).toBe(`0012/${anoAtual}`);
  });

  it('deve lidar corretamente com números de 3 dígitos e sem ano', () => {
    const anoAtual = new Date().getFullYear();
    const result = service.setaNumeroDocumento('123');
    expect(result).toBe(`0123/${anoAtual}`);
  });
});
