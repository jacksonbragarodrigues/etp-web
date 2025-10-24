import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { EtpPrazoService } from './etp-prazo.service';

describe('EtpPrazoService', () => {
  let service: EtpPrazoService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiFormulario}/etp-prazo`;

  const mockPrazo = {
    id: 1,
    motivacaoPrazo: 'Prazo para análise técnica',
    qtdDiasLimiteRevisor: 5,
    qtdDiasLimiteAnalista: 3,
    etapaId: 1,
    prioridadeId: 2,
    indStRegistro: 'A',
  };

  const mockPrazoList = [
    {
      id: 1,
      motivacaoPrazo: 'Prazo análise técnica',
      qtdDiasLimiteRevisor: 5,
      qtdDiasLimiteAnalista: 3,
      etapaId: 1,
      prioridadeId: 1,
    },
    {
      id: 2,
      motivacaoPrazo: 'Prazo análise jurídica',
      qtdDiasLimiteRevisor: 7,
      qtdDiasLimiteAnalista: 4,
      etapaId: 2,
      prioridadeId: 2,
    },
    {
      id: 3,
      motivacaoPrazo: 'Prazo análise financeira',
      qtdDiasLimiteRevisor: 10,
      qtdDiasLimiteAnalista: 6,
      etapaId: 3,
      prioridadeId: 1,
    },
  ];

  const mockPrazoTipoLicitacao = [
    {
      id: 1,
      motivacaoPrazo: 'Prazo Pregão',
      tipoLicitacao: 'PREGAO',
      qtdDiasLimiteRevisor: 3,
      qtdDiasLimiteAnalista: 2,
    },
    {
      id: 2,
      motivacaoPrazo: 'Prazo Concorrência',
      tipoLicitacao: 'CONCORRENCIA',
      qtdDiasLimiteRevisor: 15,
      qtdDiasLimiteAnalista: 10,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EtpPrazoService],
    });

    service = TestBed.inject(EtpPrazoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Inicialização do Service', () => {
    it('deve configurar apiEtpUrl corretamente', () => {
      expect(service.apiEtpUrl).toBe(baseUrl);
    });

    it('deve ter HttpClient injetado', () => {
      expect(service['http']).toBeDefined();
    });

    it('deve ser um singleton (providedIn: root)', () => {
      const service2 = TestBed.inject(EtpPrazoService);
      expect(service).toBe(service2);
    });
  });

  describe('getPrazo', () => {
    it('deve fazer GET request com parâmetros corretos', () => {
      const objParams = {
        page: 1,
        size: 10,
        motivacaoPrazo: 'teste',
        etapaId: 1,
        prioridadeId: 2,
        indStRegistro: 'A',
      };

      const mockResponse = {
        content: mockPrazoList,
        totalElements: 3,
        totalPages: 1,
      };

      service.getPrazo(objParams).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === baseUrl && request.method === 'GET';
      });

      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('motivacaoPrazo')).toBe('teste');
      expect(req.request.params.get('etapaId')).toBe('1');
      expect(req.request.params.get('prioridadeId')).toBe('2');
      expect(req.request.params.get('indStRegistro')).toBe('A');

      req.flush(mockResponse);
    });

    it('deve fazer GET request com parâmetros vazios', () => {
      const objParams = {};

      service.getPrazo(objParams).subscribe((response) => {
        expect(response).toEqual([]);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);

      req.flush([]);
    });

    it('deve fazer GET request com filtros de prazo específicos', () => {
      const objParams = {
        qtdDiasLimiteRevisorMin: 3,
        qtdDiasLimiteRevisorMax: 10,
        qtdDiasLimiteAnalistaMin: 2,
        qtdDiasLimiteAnalistaMax: 5,
        etapaIds: [1, 2, 3],
        prioridadeIds: [1, 2],
      };

      service.getPrazo(objParams).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === baseUrl && request.method === 'GET';
      });

      expect(req.request.params.get('qtdDiasLimiteRevisorMin')).toBe('3');
      expect(req.request.params.get('qtdDiasLimiteRevisorMax')).toBe('10');
      expect(req.request.params.get('qtdDiasLimiteAnalistaMin')).toBe('2');
      expect(req.request.params.get('qtdDiasLimiteAnalistaMax')).toBe('5');

      req.flush(mockPrazoList);
    });
  });

  describe('getPrazoPorTipoContratacao', () => {
    it('deve fazer GET request para tipo licitação específico', () => {
      const idTipoLicitacao = 1;
      const expectedUrl = `${baseUrl}/etp-prazo-tipo-licitacao/${idTipoLicitacao}`;

      service
        .getPrazoPorTipoContratacao(idTipoLicitacao)
        .subscribe((response) => {
          expect(response).toEqual(mockPrazoTipoLicitacao);
        });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);

      req.flush(mockPrazoTipoLicitacao);
    });

    it('deve fazer GET request com ID string', () => {
      const idTipoLicitacao = '2';
      const expectedUrl = `${baseUrl}/etp-prazo-tipo-licitacao/${idTipoLicitacao}`;

      service.getPrazoPorTipoContratacao(idTipoLicitacao).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      req.flush(mockPrazoTipoLicitacao);
    });

    it('deve fazer GET request com ID null', () => {
      const idTipoLicitacao = null;
      const expectedUrl = `${baseUrl}/etp-prazo-tipo-licitacao/${idTipoLicitacao}`;

      service.getPrazoPorTipoContratacao(idTipoLicitacao).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      req.flush([]);
    });

    it('deve fazer GET request com ID undefined', () => {
      const idTipoLicitacao = undefined;
      const expectedUrl = `${baseUrl}/etp-prazo-tipo-licitacao/${idTipoLicitacao}`;

      service.getPrazoPorTipoContratacao(idTipoLicitacao).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      req.flush([]);
    });

    it('deve tratar erro 404 para tipo não encontrado', () => {
      const idTipoLicitacao = 999;
      const expectedUrl = `${baseUrl}/etp-prazo-tipo-licitacao/${idTipoLicitacao}`;

      service.getPrazoPorTipoContratacao(idTipoLicitacao).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Tipo de licitação não encontrado', {
        status: 404,
        statusText: 'Not Found',
      });
    });

    it('deve retornar lista vazia para tipo sem prazos', () => {
      const idTipoLicitacao = 5;
      const expectedUrl = `${baseUrl}/etp-prazo-tipo-licitacao/${idTipoLicitacao}`;

      service
        .getPrazoPorTipoContratacao(idTipoLicitacao)
        .subscribe((response) => {
          expect(response).toEqual([]);
        });

      const req = httpMock.expectOne(expectedUrl);
      req.flush([]);
    });
  });

  describe('getAllPrazo', () => {
    it('deve fazer GET request para buscar todos os prazos', () => {
      const expectedUrl = `${baseUrl}/lista`;

      service.getAllPrazo().subscribe((response) => {
        expect(response).toEqual(mockPrazoList);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      expect(req.request.body).toBeNull();

      req.flush(mockPrazoList);
    });

    it('deve retornar lista vazia quando não há prazos', () => {
      const expectedUrl = `${baseUrl}/lista`;

      service.getAllPrazo().subscribe((response) => {
        expect(response).toEqual([]);
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush([]);
    });

    it('deve tratar erro de servidor', () => {
      const expectedUrl = `${baseUrl}/lista`;

      service.getAllPrazo().subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(503);
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Serviço indisponível', {
        status: 503,
        statusText: 'Service Unavailable',
      });
    });

    it('deve tratar timeout', () => {
      const expectedUrl = `${baseUrl}/lista`;

      service.getAllPrazo().subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(408);
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Timeout', { status: 408, statusText: 'Request Timeout' });
    });
  });

  describe('postPrazo', () => {
    it('deve fazer POST request com dados mínimos', () => {
      const prazoMinimo = {
        motivacaoPrazo: 'Prazo mínimo',
        indStRegistro: 'A',
      };

      service.postPrazo(prazoMinimo).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(prazoMinimo);

      req.flush({ ...prazoMinimo, id: 5 });
    });

    it('deve fazer POST request com null', () => {
      service.postPrazo(null).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();

      req.flush({});
    });

    it('deve tratar erro de validação', () => {
      const prazoInvalido = {
        qtdDiasLimiteRevisor: -1,
        qtdDiasLimiteAnalista: 'invalid',
      };

      service.postPrazo(prazoInvalido).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toContain('Dados inválidos');
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Dados inválidos: qtdDiasLimiteRevisor deve ser positivo' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('deve tratar erro de conflito', () => {
      const prazoExistente = mockPrazo;

      service.postPrazo(prazoExistente).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(409);
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Prazo já existe', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('putPrazo', () => {
    it('deve fazer PUT request com ID string', () => {
      const idPrazo = '2';
      const prazoAtualizado = { motivacaoPrazo: 'Atualizado' };
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.putPrazo(idPrazo, prazoAtualizado).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(prazoAtualizado);

      req.flush({});
    });

    it('deve fazer PUT request com dados null', () => {
      const idPrazo = 3;
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.putPrazo(idPrazo, null).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();

      req.flush({});
    });

    it('deve fazer PUT request com ID null', () => {
      const idPrazo = null;
      const prazoAtualizado = { motivacaoPrazo: 'Teste' };
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.putPrazo(idPrazo, prazoAtualizado).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');

      req.flush({});
    });

    it('deve tratar erro 404 para prazo não encontrado', () => {
      const idPrazo = 999;
      const prazoAtualizado = { motivacaoPrazo: 'Não existe' };
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.putPrazo(idPrazo, prazoAtualizado).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Prazo não encontrado', {
        status: 404,
        statusText: 'Not Found',
      });
    });

    it('deve tratar erro de validação na atualização', () => {
      const idPrazo = 1;
      const prazoInvalido = {
        qtdDiasLimiteRevisor: 'invalid',
        qtdDiasLimiteAnalista: -5,
      };
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.putPrazo(idPrazo, prazoInvalido).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(422);
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Dados inválidos', {
        status: 422,
        statusText: 'Unprocessable Entity',
      });
    });
  });

  describe('deletePrazo', () => {
    it('deve fazer DELETE request com ID do prazo', () => {
      const idPrazo = 1;
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.deletePrazo(idPrazo).subscribe((response) => {
        expect(response).toEqual({});
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      expect(req.request.params.keys().length).toBe(0);

      req.flush({});
    });

    it('deve fazer DELETE request com ID string', () => {
      const idPrazo = '2';
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.deletePrazo(idPrazo).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });

    it('deve fazer DELETE request com ID null', () => {
      const idPrazo = null;
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.deletePrazo(idPrazo).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });

    it('deve fazer DELETE request com ID undefined', () => {
      const idPrazo = undefined;
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.deletePrazo(idPrazo).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });

    it('deve tratar erro 404 para prazo não encontrado', () => {
      const idPrazo = 999;
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.deletePrazo(idPrazo).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.error).toBe('Prazo não encontrado');
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Prazo não encontrado', {
        status: 404,
        statusText: 'Not Found',
      });
    });

    it('deve tratar erro 409 para prazo em uso', () => {
      const idPrazo = 1;
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.deletePrazo(idPrazo).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(409);
          expect(error.error.message).toContain('em uso');
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(
        { message: 'Prazo está em uso e não pode ser excluído' },
        { status: 409, statusText: 'Conflict' }
      );
    });

    it('deve tratar erro 403 para falta de permissão', () => {
      const idPrazo = 1;
      const expectedUrl = `${baseUrl}/${idPrazo}`;

      service.deletePrazo(idPrazo).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(403);
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Acesso negado', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('Integração e Fluxos Completos', () => {
    it('deve executar fluxo completo de CRUD', () => {
      const novoPrazo = {
        motivacaoPrazo: 'Prazo CRUD',
        qtdDiasLimiteRevisor: 5,
        qtdDiasLimiteAnalista: 3,
        etapaId: 1,
        prioridadeId: 1,
        indStRegistro: 'A',
      };

      service.postPrazo(novoPrazo).subscribe();

      const postReq = httpMock.expectOne(baseUrl);
      expect(postReq.request.method).toBe('POST');
      postReq.flush({ ...novoPrazo, id: 10 });

      service.getAllPrazo().subscribe();

      const getAllReq = httpMock.expectOne(`${baseUrl}/lista`);
      expect(getAllReq.request.method).toBe('GET');
      getAllReq.flush([...mockPrazoList, { ...novoPrazo, id: 10 }]);

      const prazoAtualizado = {
        ...novoPrazo,
        motivacaoPrazo: 'Prazo CRUD Atualizado',
      };
      service.putPrazo(10, prazoAtualizado).subscribe();

      const putReq = httpMock.expectOne(`${baseUrl}/10`);
      expect(putReq.request.method).toBe('PUT');
      putReq.flush({ ...prazoAtualizado, id: 10 });

      service.deletePrazo(10).subscribe();

      const deleteReq = httpMock.expectOne(`${baseUrl}/10`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});
    });

    it('deve lidar com múltiplas chamadas simultâneas', () => {
      service.getAllPrazo().subscribe();
      service.getPrazo({ page: 1 }).subscribe();
      service.getPrazoPorTipoContratacao(1).subscribe();

      const requests = httpMock.match(() => true);
      expect(requests.length).toBe(3);

      requests[0].flush(mockPrazoList);
      requests[1].flush({ content: mockPrazoList });
      requests[2].flush(mockPrazoTipoLicitacao);
    });
  });

  describe('Tratamento de Erros e Edge Cases', () => {
    it('deve lidar com resposta de servidor inválida', () => {
      service.getAllPrazo().subscribe({
        next: (response) => {
          expect(response).toBeDefined();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/lista`);
      req.flush('<html>Error</html>');
    });

    it('deve manter consistência na construção de URLs', () => {
      const baseUrlSemBarra = service.apiEtpUrl.replace(/\/$/, '');

      expect(baseUrlSemBarra + '/lista').toBe(`${baseUrl}/lista`);
      expect(baseUrlSemBarra + '/etp-prazo-tipo-licitacao/1').toBe(
        `${baseUrl}/etp-prazo-tipo-licitacao/1`
      );
      expect(baseUrlSemBarra + '/1').toBe(`${baseUrl}/1`);
    });
  });
});
