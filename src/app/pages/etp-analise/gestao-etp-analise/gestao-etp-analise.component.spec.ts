import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { EtpTipoLicitacaoService } from 'src/app/services/etp-tipo-licitacao-service.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { getEnvironment } from 'src/app/app.component';
import { AppModule } from 'src/app/app.module';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';
import { EtpEtapaService } from 'src/app/services/etp-etapa-service.service';
import { GestaoEtpAnaliseService } from 'src/app/services/gestao-etp-analise.service';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { SituacaoFormularioServiceService } from 'src/app/services/situacao-formulario-service.service';
import { AlertUtils } from 'src/utils/alerts.util';
import { EtpNumeracaoService } from '../../../services/etp-numeracao.service';
import { EtpAnaliseModule } from '../etp-analise.module';
import { GestaoEtpAnaliseComponent } from './gestao-etp-analise.component';

describe('GestaoEtpAnaliseComponent', () => {
  let component: GestaoEtpAnaliseComponent;
  let fixture: ComponentFixture<GestaoEtpAnaliseComponent>;
  let gestaoEtpService: any;
  let gestaoFormularioService: any;
  let etpTipoLicitacaoService: any;
  let situacaoFormularioService: any;
  let etpNumeracaoService: any;
  let etpEtapaService: any;
  let alertUtils: AlertUtils;
  let authLoginGuard: jasmine.SpyObj<AuthLoginGuard>;

  const authLoginGuardSpy = jasmine.createSpyObj('AuthLoginGuard', [
    'hasPermission',
  ]);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoEtpAnaliseComponent],
      imports: [EtpAnaliseModule, AppModule, HttpClientTestingModule],
      providers: [
        GestaoFormularioService,
        AlertUtils,
        { provide: AuthLoginGuard, useValue: authLoginGuardSpy },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoEtpAnaliseComponent);
    component = fixture.componentInstance;
    gestaoEtpService = TestBed.inject(GestaoEtpAnaliseService);
    gestaoFormularioService = TestBed.inject(GestaoFormularioService);
    etpTipoLicitacaoService = TestBed.inject(EtpTipoLicitacaoService);
    situacaoFormularioService = TestBed.inject(
      SituacaoFormularioServiceService
    );
    etpNumeracaoService = TestBed.inject(EtpNumeracaoService);
    etpEtapaService = TestBed.inject(EtpEtapaService);
    alertUtils = TestBed.inject(AlertUtils);
    fixture.detectChanges();
    component.selectedRowDataAnalise = { descricao: 'teste' };
    component.VERSIONAR_ETP = {
      open: jasmine.createSpy('open'),
    } as any;
    authLoginGuard = TestBed.inject(
      AuthLoginGuard
    ) as jasmine.SpyObj<AuthLoginGuard>;

    component.CADASTRAR_ETP = {
      open: jasmine.createSpy('open'),
      close: jasmine.createSpy('close'),
    } as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaPage e tableLazyLoading no ngOnInit', fakeAsync(() => {
    spyOn(component, 'iniciaPageEtpAnalise');
    spyOn(component, 'tableLazyLoading');
    spyOn(component, 'getSituacaoFormularioEtpAnalise').and.returnValue(
      Promise.resolve()
    );
    spyOn(component, 'getTodosFormulariosEtpAnalise');
    spyOn(component, 'getEtpTipoLicitacaoEtpAnalise');
    spyOn(component, 'getEtapasEtpAnalise');

    component.ngOnInit();
    tick(); // Avança o tempo simulado para resolver todas as Promises.

    expect(component.iniciaPageEtpAnalise).toHaveBeenCalled();
    expect(component.tableLazyLoading).toHaveBeenCalled();
    expect(component.getSituacaoFormularioEtpAnalise).toHaveBeenCalled();
    expect(component.getTodosFormulariosEtpAnalise).toHaveBeenCalled();
    expect(component.getEtpTipoLicitacaoEtpAnalise).toHaveBeenCalled();
    expect(component.getEtapasEtpAnalise).toHaveBeenCalled();
  }));

  it('deve inicializar o objeto page corretamente', () => {
    // Chame a função iniciaPage
    component.iniciaPageEtpAnalise();

    // Verifique se o objeto page foi criado corretamente
    expect(component.pageEtpAnalise).toEqual({
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: component.pageEtpAnalise.totalElements,
      totalPages: Math.ceil(
        component.pageEtpAnalise.totalElements / component.pageEtpAnalise.size
      ),
    });
  });

  it('deve redefinir a direção de classificação para colunas não selecionadas', () => {
    component.pageEtpAnalise.sort = 'descricao,asc';
    const coluna = 'descricao';
    const direcao = 'desc';
    spyOn(component, 'getPesquisarEtpEtpAnalise');
    component.onSort({ coluna, direcao });
    expect(component.pageEtpAnalise.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarEtpEtpAnalise).toHaveBeenCalled();
    component.headers.forEach((header: any) => {
      if (header.sortable !== coluna) {
        expect(header.direcao).toBe('');
      } else {
        expect(header.direcao).toBe(direcao);
      }
    });
  });

  it('deve chamar a funcao getSituacaoFormulario', () => {
    const response: any = {};
    const service: SituacaoFormularioServiceService =
      fixture.debugElement.injector.get(SituacaoFormularioServiceService);
    spyOn(service, 'getSituacaoFormulario').and.returnValue(of(response));
    component.getSituacaoFormularioEtpAnalise();
    expect(service.getSituacaoFormulario).toHaveBeenCalled();
  });

  it('deve chamar a funcao getTodosFormularios', () => {
    const response: any = {};
    const service: GestaoFormularioService = fixture.debugElement.injector.get(
      GestaoFormularioService
    );
    spyOn(service, 'getFormulariosPublicados').and.returnValue(of(response));
    component.getTodosFormulariosEtpAnalise();
    expect(service.getFormulariosPublicados).toHaveBeenCalled();
  });

  it('deve chamar a funcao getEtpTipoLicitacao', () => {
    const response: any = {};
    const service: EtpTipoLicitacaoService = fixture.debugElement.injector.get(
      EtpTipoLicitacaoService
    );
    spyOn(service, 'getEtpTipoLicitacaoLista').and.returnValue(of(response));
    component.getEtpTipoLicitacaoEtpAnalise();
    expect(service.getEtpTipoLicitacaoLista).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtp POST', () => {
    const response: any = {};
    const objEtp = {
      formulario: 1,
      tipoLicitacao: 1,
      situacao: 1,
      descricao: 'teste',
      jsonDados: {},
      etpPai: undefined,
      versao: 1,
    };
    const service: GestaoEtpAnaliseService = fixture.debugElement.injector.get(
      GestaoEtpAnaliseService
    );
    spyOn(service, 'postEtpAnalise').and.returnValue(of(response));
    component.gravarEtpEtpAnalise(objEtp);
    expect(service.postEtpAnalise).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtp PUT', () => {
    const response: any = {};
    const objEtp = {
      id: 1,
      formulario: 1,
      tipoLicitacao: 1,
      situacao: 1,
      descricao: 'teste',
      jsonDados: {},
      etpPai: undefined,
      versao: 1,
      ano: undefined,
      etpNumeracao: undefined,
      processoSei: undefined,
      etapa: undefined,
    };
    const service: GestaoEtpAnaliseService = fixture.debugElement.injector.get(
      GestaoEtpAnaliseService
    );
    spyOn(service, 'putEtpAnalise').and.returnValue(of(response));
    component.gravarEtpEtpAnalise(objEtp);
    expect(service.putEtpAnalise).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirEtp', () => {
    const response: any = {
      teste: '1',
    };
    const objEtp = {
      id: 1,
    };
    const service: GestaoEtpAnaliseService = fixture.debugElement.injector.get(
      GestaoEtpAnaliseService
    );
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);

    spyOn(service, 'deleteEtpAnalise').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(component, 'tableLazyLoading');

    component.excluirETPEtpAnalise(objEtp);

    expect(alert.confirmDialog).toHaveBeenCalledWith(`Deseja excluir o ETP?`);
  });

  it('deve chamar open ao chamar cadastrarEtp', () => {
    component.cadastrarETPEtpAnalise();

    expect(component.CADASTRAR_ETP.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarFormulario', () => {
    component.editarETPEtpAnalise({ id: 1 });

    expect(component.CADASTRAR_ETP.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoETPFiltroForm, 'reset');
    component.limparCamposEtpAnalise();

    expect(component.gestaoETPFiltroForm.reset).toHaveBeenCalled();
  });

  it('deve retornar true para uma ação permitida', () => {
    const objEtp = {
      id: 1,
      formulario: 1,
      tipoLicitacao: 1,
      situacao: 1,
      descricao: 'teste',
      jsonDados: {},
      etpPai: undefined,
      versao: 1,
      acoesFormulario: ['EDITAR'],
    };

    const result = component.acaoPermitidaEtpAnalise(objEtp, 'EDITAR');

    expect(result).toBe(true);
  });

  it('deve retornar false para ação não permitida', () => {
    const objEtp = {
      id: 1,
      formulario: 1,
      tipoLicitacao: 1,
      situacao: 1,
      descricao: 'teste',
      jsonDados: {},
      etpPai: undefined,
      versao: 1,
      acoesFormulario: ['VERSIONAR'],
    };

    const result = component.acaoPermitidaEtpAnalise(objEtp, 'EDITAR');

    expect(result).toBe(false);
  });

  it('deve chamar confirmDialog e patchEtp em caso de confirmação', fakeAsync(() => {
    const objMock = { id: 1 };
    const acao = 'REABRIR';
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(gestaoEtpService, 'patchEtpAnalise').and.returnValue(of({}));
    spyOn(alertUtils, 'handleSucess');

    component.trocarSituacaoEtpEtpAnalise(objMock, acao);
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(gestaoEtpService.patchEtpAnalise).toHaveBeenCalledWith(1, 'REABRIR');
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Ação reabrir realizada com sucesso'
    );
  }));

  it('deve chamar executaVersionar e handleSucess se o usuário confirmar', fakeAsync(() => {
    const itemMock = {
      id: 1,
      situacao: { descricao: 'Assunto' },
      formulario: { descricao: 'Formulario' },
      descricao: 'Descrição',
      versao: 'V1',
    };
    spyOn(gestaoEtpService, 'versionarEtpAnalise').and.returnValue(of({}));
    spyOn(alertUtils, 'handleSucess');

    component.executaVersionarEtpAnalise(itemMock);

    // Avançar o tempo para processar a Promise e esvaziar a fila de timers
    tick();

    expect(gestaoEtpService.versionarEtpAnalise).toHaveBeenCalledWith(
      1,
      undefined
    );
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Versão gerada com sucesso'
    );
  }));

  it('should return false if the start date is after the end date', () => {
    const dataInicial = new Date('2024-01-02');
    const dataFinal = new Date('2024-01-01');
    expect(component.validaDataEtpAnalise(dataInicial, dataFinal)).toBeFalse();
  });

  it('should return true if the start date is before the end date', () => {
    const dataInicial = new Date('2024-01-01');
    const dataFinal = new Date('2024-01-02');
    expect(component.validaDataEtpAnalise(dataInicial, dataFinal)).toBeTrue();
  });

  it('should return true if the start date is the same as the end date', () => {
    const dataInicial = new Date('2024-01-01');
    const dataFinal = new Date('2024-01-01');
    expect(component.validaDataEtpAnalise(dataInicial, dataFinal)).toBeTrue();
  });

  // it('should adjust date to the start of the day in local timezone', () => {
  //   // Supõe-se que este seja o horário UTC para o teste
  //   const testDate = new Date(Date.UTC(2024, 0, 1, 3)); // 3 AM UTC, equivalente a 00:00 em Brasília (UTC-3)

  //   const adjustedDate = component.adjustDateToLocalDayBoundsEtpAnalise(
  //     testDate,
  //     'inicial'
  //   );

  //   // Cria a data esperada ajustada para 00:00 no horário local de Brasília
  //   const expectedDate = new Date(Date.UTC(2024, 0, 1, 3)); // Deveria ser igual ao testDate
  //   expectedDate.setHours(0, 0, 0, 0); // ajustado para 00:00 local

  //   expect(adjustedDate.toISOString()).toEqual(expectedDate.toISOString());
  // });

  // it('should handle dates when timezone offset is not the standard Brasilia UTC-3', () => {
  //   const testDate = new Date('2024-06-01T12:00:00Z');
  //   const expectedDate = new Date('2024-06-01T23:59:59.999Z');
  //   expectedDate.setHours(23, 59, 59, 999); // Ajusta para o fim do dia no fuso horário local
  //   const adjustedDate = component.adjustDateToLocalDayBoundsEtpAnalise(
  //     testDate,
  //     'final'
  //   );
  //   expect(adjustedDate).toEqual(expectedDate);
  // });

  it('deve limpar os filtros avançados de EtpAnalise', () => {
    // Espionamos o método setValue para cada controle do form
    const unidadeId = component.formControl['unidadeId'];
    const etpEtapa = component.formControl['etpEtapa'];
    const dataRegistroInicial = component.formControl['dataRegistroInicial'];
    const dataRegistroFinal = component.formControl['dataRegistroFinal'];
    const servidor = component.formControl['servidor'];

    spyOn(unidadeId, 'setValue');
    spyOn(etpEtapa, 'setValue');
    spyOn(dataRegistroInicial, 'setValue');
    spyOn(dataRegistroFinal, 'setValue');
    spyOn(servidor, 'setValue');

    // Executa o método
    component.limparFiltrosAvancadosEtpAnalise({});

    // Verifica se todos os campos foram limpos (setados como null)
    expect(unidadeId.setValue).toHaveBeenCalledWith(null);
    expect(etpEtapa.setValue).toHaveBeenCalledWith(null);
    expect(dataRegistroInicial.setValue).toHaveBeenCalledWith(null);
    expect(dataRegistroFinal.setValue).toHaveBeenCalledWith(null);
    expect(servidor.setValue).toHaveBeenCalledWith(null);
  });

  it('deve cancelar e remover o timer se o id estiver presente em timersBloqueio', () => {
    const id = '123';
    const fakeTimeout = jasmine.createSpy('fakeTimeout');
    spyOn(window, 'clearTimeout');

    // Simula o mapa com o timer
    component.timersBloqueio.set(id, fakeTimeout as any);

    // Executa o método
    component.cancelTimerEtpAnalise(id);

    // Valida que o clearTimeout foi chamado com o timer correto
    expect(clearTimeout).toHaveBeenCalledWith(fakeTimeout);

    // Valida que o id foi removido do mapa
    expect(component.timersBloqueio.has(id)).toBeFalse();
  });

  it('não deve fazer nada se o id não estiver presente em timersBloqueio', () => {
    const id = '999';
    spyOn(window, 'clearTimeout');

    // Garante que o id não existe
    expect(component.timersBloqueio.has(id)).toBeFalse();

    // Executa o método
    component.cancelTimerEtpAnalise(id);

    // Valida que o clearTimeout não foi chamado
    expect(clearTimeout).not.toHaveBeenCalled();
  });

  it('deve chamar cancelTimerEtpAnalise e putBloqueioEtpAnalise com os dados corretos', () => {
    const dados = { id: 123, bloqueado: true };
    const spyCancel = spyOn(component, 'cancelTimerEtpAnalise');
    const spyPut = spyOn(
      gestaoEtpService,
      'putBloqueioEtpAnalise'
    ).and.returnValue(of(null)); // simula sucesso
    spyOn(alertUtils, 'toastrErrorMsg');

    component.bloquearEtpAnalise(dados);

    expect(spyCancel).toHaveBeenCalledWith(123);
    expect(spyPut).toHaveBeenCalledWith(123, { bloqueado: true });
    expect(alertUtils.toastrErrorMsg).not.toHaveBeenCalled();
  });

  it('deve exibir mensagem de erro se putBloqueioEtpAnalise falhar', () => {
    const dados = { id: 456, bloqueado: false };
    const erro = 'Erro ao bloquear';
    spyOn(component, 'cancelTimerEtpAnalise');
    spyOn(gestaoEtpService, 'putBloqueioEtpAnalise').and.returnValue(
      throwError(() => erro)
    );
    const spyToastr = spyOn(alertUtils, 'toastrErrorMsg');

    component.bloquearEtpAnalise(dados);

    expect(spyToastr).toHaveBeenCalledWith(erro);
  });

  it('deve cancelar o timer existente, agendar novo e chamar putBloqueioEtpAnalise após o tempo', fakeAsync(() => {
    const idEtp = '123';
    const timeoutMs = getEnvironment().bloqueioTimeOut * 60 * 1000;

    // Espionar os métodos necessários
    const spyCancel = spyOn(component, 'cancelTimerEtpAnalise');
    const spyPut = spyOn(
      gestaoEtpService,
      'putBloqueioEtpAnalise'
    ).and.returnValue(of({}));

    // Executar o método
    component.executarAposMinutosEtpAnalise(idEtp);

    // Verificar se cancelTimer foi chamado
    expect(spyCancel).toHaveBeenCalledWith(idEtp);

    // Verificar se o timer foi armazenado
    expect(component.timersBloqueio.has(idEtp)).toBeTrue();

    // Simular a passagem do tempo
    tick(timeoutMs);

    // Verificar se a requisição foi feita após o tempo
    expect(spyPut).toHaveBeenCalledWith(idEtp, { bloqueado: false });
  }));

  // it('deve obter etapas de ETP e atribuí-las a etapaList', () => {
  //   const etapasMock = [
  //     { id: 1, nome: 'Planejamento', chave: 'AGUARDANDO_ANALISE' },
  //     { id: 2, nome: 'Execução', chave: 'AGUARDANDO_REVISAO' },
  //   ];
  //   const getSpy = spyOn(etpEtapaService, 'getEtpEtapaLista').and.returnValue(
  //     of(etapasMock)
  //   );

  //   component.getEtapasEtpAnalise();

  //   expect(getSpy).toHaveBeenCalled();
  //   expect(component.etapaList).toEqual(etapasMock);
  // });

  describe('gravarDadosFormularioEtpEtpAnalise', () => {
    it('deve chamar putEtpAnalise com os dados corretos', () => {
      const dadosMock = { id: 10, jsonDados: { campo: 'valor' } };
      const spyPut = spyOn(gestaoEtpService, 'putEtpAnalise').and.returnValue(
        of({})
      );
      spyOn(alertUtils, 'toastrErrorMsg');

      component.garvarDadosFormularioEtpEtpAnalise(dadosMock);

      expect(spyPut).toHaveBeenCalledWith(10, {
        jsonDados: dadosMock.jsonDados,
      });
      expect(alertUtils.toastrErrorMsg).not.toHaveBeenCalled();
    });

    it('deve exibir erro se putEtpAnalise falhar', () => {
      const dadosMock = { id: 20, jsonDados: { campo: 'erro' } };
      const erroSimulado = 'Erro ao gravar dados';
      spyOn(gestaoEtpService, 'putEtpAnalise').and.returnValue(
        throwError(() => erroSimulado)
      );
      const spyError = spyOn(alertUtils, 'toastrErrorMsg');

      component.garvarDadosFormularioEtpEtpAnalise(dadosMock);

      expect(spyError).toHaveBeenCalledWith(erroSimulado);
    });
  });
  describe('garvarDadosFormularioEtpNextEtpAnalise', () => {
    it('deve chamar patchNextEtpAnalise com os dados corretos', () => {
      const dadosMock = { id: 15, jsonDados: { campo: 'teste' } };
      const spyPatch = spyOn(
        gestaoEtpService,
        'patchNextEtpAnalise'
      ).and.returnValue(of({}));
      spyOn(alertUtils, 'toastrErrorMsg');

      component.gravarDadosFormularioEtpNextEtpAnalise(dadosMock);

      expect(spyPatch).toHaveBeenCalledWith(15, {
        jsonDados: dadosMock.jsonDados,
      });
      expect(alertUtils.toastrErrorMsg).not.toHaveBeenCalled();
    });

    it('deve exibir erro se patchNextEtpAnalise falhar', () => {
      const dadosMock = { id: 99, jsonDados: { campo: 'erro' } };
      const erroSimulado = 'Erro no patch';
      spyOn(gestaoEtpService, 'patchNextEtpAnalise').and.returnValue(
        throwError(() => erroSimulado)
      );
      const spyError = spyOn(alertUtils, 'toastrErrorMsg');

      component.gravarDadosFormularioEtpNextEtpAnalise(dadosMock);

      expect(spyError).toHaveBeenCalledWith(erroSimulado);
    });
  });

  describe('atualizarFormularioEtpEtpAnalise', () => {
    it('deve chamar patchFormularioEtpAnalise com id e idFormulario', () => {
      const etpMock = { id: 42, idFormulario: 7 };
      const spyPatch = spyOn(
        gestaoEtpService,
        'patchFormularioEtpAnalise'
      ).and.returnValue(of({}));
      spyOn(alertUtils, 'toastrErrorMsg');

      component.atualizarFormularioEtpEtpAnalise(etpMock);

      expect(spyPatch).toHaveBeenCalledWith(42, 7);
      expect(alertUtils.toastrErrorMsg).not.toHaveBeenCalled();
    });

    it('deve exibir erro se patchFormularioEtpAnalise falhar', () => {
      const etpMock = { id: 77, idFormulario: 88 };
      const erroSimulado = 'Erro ao atualizar formulário';
      spyOn(gestaoEtpService, 'patchFormularioEtpAnalise').and.returnValue(
        throwError(() => erroSimulado)
      );
      const spyToastr = spyOn(alertUtils, 'toastrErrorMsg');

      component.atualizarFormularioEtpEtpAnalise(etpMock);

      expect(spyToastr).toHaveBeenCalledWith(erroSimulado);
    });
  });

  describe('validaProcessoSeiEtpAnalise', () => {
    it('deve retornar isValidProcessosei true e extrair partes quando o formato for válido', () => {
      const input = 'STJ 12345/2025';

      const resultado = component.validaProcessoSeiEtpAnalise(input);

      expect(resultado.isValidProcessosei).toBeTrue();
      expect(resultado.processoSeiId).toBe('STJ 12345');
      expect(resultado.anoSeiId).toBe('2025');
    });

    it('deve retornar isValidProcessosei true e strings vazias quando o formato for inválido', () => {
      const input = 'INVALIDO 123/2025';

      const resultado = component.validaProcessoSeiEtpAnalise(input);

      expect(resultado.isValidProcessosei).toBeTrue();
      expect(resultado.processoSeiId).toBe('');
      expect(resultado.anoSeiId).toBe('');
    });

    it('deve retornar isValidProcessosei true e strings vazias para string vazia', () => {
      const resultado = component.validaProcessoSeiEtpAnalise('');

      expect(resultado.isValidProcessosei).toBeTrue();
      expect(resultado.processoSeiId).toBe('');
      expect(resultado.anoSeiId).toBe('');
    });
  });

  describe('validaNumeroProcessoSeiEtpAnalise', () => {
    it('deve retornar true e extrair processo e ano quando o número tem 11 caracteres', () => {
      const numero = '123456/2025';

      const resultado = component.validaNumeroProcessoSeiEtpAnalise(numero);

      expect(resultado.isValidProcessosei).toBeTrue();
      expect(resultado.processoSeiId).toBe('123456');
      expect(resultado.anoSeiId).toBe('2025');
    });

    it('deve retornar false quando o número não tem 11 caracteres', () => {
      const numero = '12345/2025'; // 10 caracteres

      const resultado = component.validaNumeroProcessoSeiEtpAnalise(numero);

      expect(resultado.isValidProcessosei).toBeFalse();
      expect(resultado.processoSeiId).toBeUndefined();
      expect(resultado.anoSeiId).toBeUndefined();
    });
  });
  it('deve parar a propagação do evento e definir selectedRowData', () => {
    const mockEvent = jasmine.createSpyObj('event', ['stopPropagation']);
    const item = { id: 123, nome: 'Teste' };

    component.selecionaItemEtpAnalise(mockEvent, item);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.selectedRowDataAnalise).toBe(item);
  });

  describe('construirItensEtpAnalise', () => {
    let etpAnaliseMock: any;
    let todasVersoes: boolean;

    beforeEach(() => {
      component.selectedRowDataAnalise = { id: 1 };
      etpAnaliseMock = {
        acoesFormulario: [],
        versao: 2,
      };
      todasVersoes = false;

      spyOn(component, 'elaborarEtpEtpAnalise');
      spyOn(component, 'editarETPEtpAnalise');
      spyOn(component, 'excluirETPEtpAnalise');
      spyOn(component, 'trocarSituacaoEtpEtpAnalise');
      spyOn(component, 'versionarEtpEtpAnalise');
      spyOn(component, 'getTodasVersoesEtpEtpAnalise');
    });

    it('deve sempre incluir o item "Visualizar"', () => {
      const itens = component.construirItensEtpAnalise(
        etpAnaliseMock,
        todasVersoes
      );
      expect(itens.some((i) => i.label === 'Visualizar')).toBeTrue();
    });

    it('deve incluir somente ações presentes em acoesFormulario', () => {
      etpAnaliseMock.acoesFormulario = [
        'EDITAR',
        'EXCLUIR',
        'REABRIR',
        'FECHAR',
        'CANCELAR',
        'PUBLICAR',
        'SUSPENDER',
        'VERSIONAR',
      ];
      const itens = component.construirItensEtpAnalise(
        etpAnaliseMock,
        todasVersoes
      );

      const labelsEsperados = [
        'Visualizar',
        'Editar',
        'Excluir',
        'Reabrir',
        'Fechar',
        'Cancelar',
        'Publicar',
        'Suspender',
        'Versionar',
      ];
      labelsEsperados.forEach((label) => {
        expect(itens.some((i) => i.label === label)).toBeTrue();
      });
    });

    it('deve incluir "Versões" se todasVersoes for true e versao diferente de 1', () => {
      etpAnaliseMock.acoesFormulario = [];
      etpAnaliseMock.versao = 2;
      todasVersoes = true;

      const itens = component.construirItensEtpAnalise(
        etpAnaliseMock,
        todasVersoes
      );
      expect(itens.some((i) => i.label === 'Versões')).toBeTrue();
    });

    it('não deve incluir "Versões" se todasVersoes for false', () => {
      etpAnaliseMock.versao = 2;
      todasVersoes = false;

      const itens = component.construirItensEtpAnalise(
        etpAnaliseMock,
        todasVersoes
      );
      expect(itens.some((i) => i.label === 'Versões')).toBeFalse();
    });

    it('não deve incluir "Versões" se versao for 1', () => {
      etpAnaliseMock.versao = 1;
      todasVersoes = true;

      const itens = component.construirItensEtpAnalise(
        etpAnaliseMock,
        todasVersoes
      );
      expect(itens.some((i) => i.label === 'Versões')).toBeFalse();
    });

    it('os comandos devem chamar os métodos corretos', () => {
      etpAnaliseMock.acoesFormulario = [
        'EDITAR',
        'EXCLUIR',
        'REABRIR',
        'FECHAR',
        'CANCELAR',
        'PUBLICAR',
        'SUSPENDER',
        'VERSIONAR',
      ];
      etpAnaliseMock.versao = 2;
      todasVersoes = true;

      const itens = component.construirItensEtpAnalise(
        etpAnaliseMock,
        todasVersoes
      );

      const visualizar = itens.find((i) => i.label === 'Visualizar');
      expect(visualizar).toBeDefined();
      visualizar!.command!({});
      expect(component.elaborarEtpEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise,
        true
      );

      const editar = itens.find((i) => i.label === 'Editar');
      expect(editar).toBeDefined();
      editar!.command!({});
      expect(component.editarETPEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise
      );

      const excluir = itens.find((i) => i.label === 'Excluir');
      expect(excluir).toBeDefined();
      excluir!.command!({});
      expect(component.excluirETPEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise
      );

      const reabrir = itens.find((i) => i.label === 'Reabrir');
      expect(reabrir).toBeDefined();
      reabrir!.command!({});
      expect(component.trocarSituacaoEtpEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise,
        'REABRIR'
      );

      const fechar = itens.find((i) => i.label === 'Fechar');
      expect(fechar).toBeDefined();
      fechar!.command!({});
      expect(component.trocarSituacaoEtpEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise,
        'FECHAR'
      );

      const cancelar = itens.find((i) => i.label === 'Cancelar');
      expect(cancelar).toBeDefined();
      cancelar!.command!({});
      expect(component.trocarSituacaoEtpEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise,
        'CANCELAR'
      );

      const publicar = itens.find((i) => i.label === 'Publicar');
      expect(publicar).toBeDefined();
      publicar!.command!({});
      expect(component.trocarSituacaoEtpEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise,
        'PUBLICAR'
      );

      const suspender = itens.find((i) => i.label === 'Suspender');
      expect(suspender).toBeDefined();
      suspender!.command!({});
      expect(component.trocarSituacaoEtpEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise,
        'SUSPENDER'
      );

      const versionar = itens.find((i) => i.label === 'Versionar');
      expect(versionar).toBeDefined();
      versionar!.command!({});
      expect(component.versionarEtpEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise
      );

      const versoes = itens.find((i) => i.label === 'Versões');
      expect(versoes).toBeDefined();
      versoes!.command!({});
      expect(component.getTodasVersoesEtpEtpAnalise).toHaveBeenCalledWith(
        component.selectedRowDataAnalise,
        component.pageEtpAnalise
      );
    });
  });
  it('deve abrir VERSIONAR_ETP se confirmação for true', async () => {
    const itemMock = { descricao: 'Teste descrição' };

    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));

    await component.versionarEtpEtpAnalise(itemMock);

    expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
      jasmine.stringContaining(itemMock.descricao)
    );
    expect(component.VERSIONAR_ETP.open).toHaveBeenCalledWith(itemMock);
  });

  it('não deve abrir VERSIONAR_ETP se confirmação for falsa', async () => {
    const itemMock = { descricao: 'Teste descrição' };

    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(false));

    await component.versionarEtpEtpAnalise(itemMock);

    expect(component.VERSIONAR_ETP.open).not.toHaveBeenCalled();
  });
});
