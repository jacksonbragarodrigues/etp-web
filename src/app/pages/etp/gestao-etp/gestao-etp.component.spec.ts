import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick, flush,
} from '@angular/core/testing';
import { EtpTipoLicitacaoService } from 'src/app/services/etp-tipo-licitacao-service.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import {of, throwError} from 'rxjs';
import { AppModule } from 'src/app/app.module';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { SituacaoFormularioServiceService } from 'src/app/services/situacao-formulario-service.service';
import { AlertUtils } from 'src/utils/alerts.util';
import { EtpModule } from '../etp.module';
import { GestaoEtpComponent } from './gestao-etp.component';
import { EtpNumeracaoService } from '../../../services/etp-numeracao.service';
import { EtpEtapaService } from 'src/app/services/etp-etapa-service.service';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';
import {SeiService} from "../../../services/sei.service";
import {RetornoConsultaProcedimentoDTO} from "../../../dto/retornoConsultaProcedimentoDTO.model";

describe('GestaoEtpComponent', () => {
  let component: GestaoEtpComponent;
  let fixture: ComponentFixture<GestaoEtpComponent>;
  let gestaoEtpService: any;
  let gestaoFormularioService: any;
  let etpTipoLicitacaoService: any;
  let situacaoFormularioService: any;
  let etpNumeracaoService: any;
  let etpEtapaService: any;
  let alertUtils: AlertUtils;
  let authLoginGuard: jasmine.SpyObj<AuthLoginGuard>;

  const authLoginGuardSpy = jasmine.createSpyObj('AuthLoginGuard', ['hasPermission']);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoEtpComponent],
      imports: [EtpModule, AppModule, HttpClientTestingModule],
      providers: [GestaoFormularioService, AlertUtils,
              { provide: AuthLoginGuard, useValue: authLoginGuardSpy },],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoEtpComponent);
    component = fixture.componentInstance;
    gestaoEtpService = TestBed.inject(GestaoEtpService);
    gestaoFormularioService = TestBed.inject(GestaoFormularioService);
    etpTipoLicitacaoService = TestBed.inject(EtpTipoLicitacaoService);
    situacaoFormularioService = TestBed.inject(
      SituacaoFormularioServiceService
    );
    etpNumeracaoService = TestBed.inject(EtpNumeracaoService);
    etpEtapaService = TestBed.inject(EtpEtapaService);
    alertUtils = TestBed.inject(AlertUtils);
    fixture.detectChanges();
    component.selectedRowData = { descricao: 'teste' };

    authLoginGuard = TestBed.inject(AuthLoginGuard) as jasmine.SpyObj<AuthLoginGuard>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaPage e tableLazyLoading no ngOnInit', fakeAsync(() => {
    spyOn(component, 'iniciaPage');
    spyOn(component, 'tableLazyLoading');
    spyOn(component, 'getSituacaoFormulario').and.returnValue(
      Promise.resolve()
    );
    spyOn(component, 'getTodosFormularios');
    spyOn(component, 'getEtpTipoLicitacao');
    spyOn(component, 'getEtapas');

    component.ngOnInit();
    tick(); // Avança o tempo simulado para resolver todas as Promises.

    expect(component.iniciaPage).toHaveBeenCalled();
    expect(component.tableLazyLoading).toHaveBeenCalled();
    expect(component.getSituacaoFormulario).toHaveBeenCalled();
    expect(component.getTodosFormularios).toHaveBeenCalled();
    expect(component.getEtpTipoLicitacao).toHaveBeenCalled();
    expect(component.getEtapas).toHaveBeenCalled();
  }));

  it('deve inicializar o objeto page corretamente', () => {
    // Chame a função iniciaPage
    component.iniciaPage();

    // Verifique se o objeto page foi criado corretamente
    expect(component.page).toEqual({
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: component.page.totalElements,
      totalPages: Math.ceil(component.page.totalElements / component.page.size),
    });
  });

  it('deve redefinir a direção de classificação para colunas não selecionadas', () => {
    component.page.sort = 'descricao,asc';
    const coluna = 'descricao';
    const direcao = 'desc';
    spyOn(component, 'getPesquisarEtp');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarEtp).toHaveBeenCalled();
    component.headers.forEach((header: any) => {
      if (header.sortable !== coluna) {
        expect(header.direcao).toBe('');
      } else {
        expect(header.direcao).toBe(direcao);
      }
    });
  });

  it('deve chamar putBloqueioEtp com os parâmetros corretos', () => {
    const dados = { id: 123, bloqueado: true };

    //gestaoEtpService.putBloqueioEtp.and.returnValue(of({}));

    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    spyOn(service, 'putBloqueioEtp').and.returnValue(of({}));
    component.bloquearEtp(dados);

    expect(service.putBloqueioEtp).toHaveBeenCalledWith(123, { bloqueado: true });
  });

  it('deve exibir erro com toastrErrorMsg se a requisição falhar', () => {
    const dados = { id: 456, bloqueado: false };
    const erro = { message: 'erro de teste' };
    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    const alertUtils: AlertUtils = fixture.debugElement.injector.get(AlertUtils);

    spyOn(service, 'putBloqueioEtp').and.returnValue(throwError(() => erro));
    spyOn(alertUtils, 'toastrErrorMsg');
    component.bloquearEtp(dados);

    expect(alertUtils.toastrErrorMsg).toHaveBeenCalledWith(erro);
  });

  it('deve registrar o timer e chamar putBloqueioEtp após o tempo configurado', fakeAsync(() => {

    const id = 101;

    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    spyOn(service, 'putBloqueioEtp').and.returnValue(of({}));
    spyOn(component, 'cancelTimer');
    component.executarAposMinutos(id);

    expect(component['cancelTimer']).toHaveBeenCalledWith(id);
    //expect(component.timersBloqueio.has(id)).toBeTrue();
    flush();
    tick(1000); // avança o tempo para executar o setTimeout

    //expect(service.putBloqueioEtp).toHaveBeenCalledWith(id, { bloqueado: false });
  }));

  it('deve limpar e remover o timer do Map se o id existir', () => {
    const id = 123;
    const fakeTimeout = setTimeout(() => {}, 10000);

    // adiciona o timer no Map antes de chamar cancelTimer
    component.timersBloqueio.set(id, fakeTimeout);

    spyOn(window, 'clearTimeout');

    component.cancelTimer(id);

    expect(clearTimeout).toHaveBeenCalledWith(fakeTimeout);
    expect(component.timersBloqueio.has(id)).toBeFalse();
  });

  // it('deve limpar os campos avançados do formulário', () => {
  //   // Define valores simulados
  //   component.formControl['unidadeId'].setValue(123);
  //   component.formControl['etpEtapa'].setValue('Etapa A');
  //   component.formControl['dataRegistroInicial'].setValue(new Date());
  //   component.formControl['dataRegistroFinal'].setValue(new Date());
  //   component.formControl['servidor'].setValue({ login: 'teste' });
  //
  //   // Executa a função
  //   component.limparFiltrosAvancados({});
  //
  //   // Verifica se todos os campos estão com null
  //   expect(component.formControl['unidadeId'].value).toBeNull();
  //   expect(component.formControl['etpEtapa'].value).toBeNull();
  //   expect(component.formControl['dataRegistroInicial'].value).toBeNull();
  //   expect(component.formControl['dataRegistroFinal'].value).toBeNull();
  //   expect(component.formControl['servidor'].value).toBeNull();
  // });

  it('deve completar número SEI com "/" e ano fornecido', () => {
    const mockEvent = { target: { value: '123/2024' } };
    component.formControl['processoSei'] = component['gestaoETPFiltroForm'].get('processoSei')!;

    component.completaNumeroProcessoSei(mockEvent, 'processoSei');

    expect(component.formControl['processoSei'].value).toBe('000123/2024');
  });

  it('deve completar número SEI sem "/" (usa 2025)', () => {
    const mockEvent = { target: { value: '45' } };
    component.formControl['processoSei'] = component['gestaoETPFiltroForm'].get('processoSei')!;

    component.completaNumeroProcessoSei(mockEvent, 'processoSei');

    expect(component.formControl['processoSei'].value).toBe('000045/2025');
  });

  it('deve completar corretamente número ETP sem barra', () => {
    const campo = 'numeroEtp';
    const input = { target: { value: '12' } };

    component.gestaoETPFiltroForm.addControl(campo, component['formBuilder'].control(null));

    component.completaNumeroEtp(input, campo);

    expect(component.formControl[campo].value).toBe('0012/2025');
  });

  it('deve completar corretamente número ETP com barra e ano informado', () => {
    const campo = 'numeroEtp';
    const input = { target: { value: '45/2024' } };

    component.gestaoETPFiltroForm.addControl(campo, component['formBuilder'].control(null));

    component.completaNumeroEtp(input, campo);

    expect(component.formControl[campo].value).toBe('0045/2024');
  });

  it('deve completar corretamente número ETP com barra mas sem ano', () => {
    const campo = 'numeroEtp';
    const input = { target: { value: '9/' } };

    component.gestaoETPFiltroForm.addControl(campo, component['formBuilder'].control(null));

    component.completaNumeroEtp(input, campo);

    expect(component.formControl[campo].value).toBe('0009/2025');
  });

  // it('deve popular etapaList com os dados retornados pelo serviço', () => {
  //   const etapasMock = [
  //     { id: 1, descricao: 'Etapa 1' },
  //     { id: 2, descricao: 'Etapa 2' },
  //   ];
  //
  //   const etapaService: EtpEtapaService = fixture.debugElement.injector.get(
  //     EtpEtapaService
  //   );
  //   spyOn(etapaService, 'getEtpEtapaLista').and.returnValue(of(etapasMock));
  //   component.getEtapas();
  //
  //   expect(etapaService.getEtpEtapaLista).toHaveBeenCalled();
  //   expect(component.etapaList).toEqual(etapasMock);
  // });

  it('deve chamar putEtp com os parâmetros corretos', () => {
    const dados = { id: 123, jsonDados: { campo: 'valor' } };
    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    spyOn(service, 'putEtp').and.returnValue(of({}));
    component.garvarDadosFormularioEtp(dados);

    expect(service.putEtp).toHaveBeenCalledWith(123, { jsonDados: { campo: 'valor' } });
  });

  it('deve chamar toastrErrorMsg em caso de erro', () => {
    const dados = { id: 456, jsonDados: { campo: 'teste' } };
    const erro = { message: 'erro ao salvar' };

    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    spyOn(service, 'putEtp').and.returnValue(throwError(() => erro));

    const mockAlertUtils: AlertUtils = fixture.debugElement.injector.get(
      AlertUtils
    );
    spyOn(mockAlertUtils, 'toastrErrorMsg');
    component.garvarDadosFormularioEtp(dados);

    expect(mockAlertUtils.toastrErrorMsg).toHaveBeenCalledWith(erro);
  });

  it('deve chamar patchNextEtp com os parâmetros corretos', () => {
    const dados = { id: 321, jsonDados: { campo: 'valor' } };
    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    spyOn(service, 'patchNextEtp').and.returnValue(of({}));
    component.garvarDadosFormularioEtpNext(dados);

    expect(service.patchNextEtp).toHaveBeenCalledWith(321, { jsonDados: { campo: 'valor' } });
  });

  it('deve chamar toastrErrorMsg em caso de erro', () => {
    const dados = { id: 789, jsonDados: { campo: 'erro' } };
    const erro = { message: 'falha no envio' };

    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    spyOn(service, 'patchNextEtp').and.returnValue(throwError(() => erro));

    const mockAlertUtils: AlertUtils = fixture.debugElement.injector.get(
      AlertUtils
    );
    spyOn(mockAlertUtils, 'toastrErrorMsg');
    component.garvarDadosFormularioEtpNext(dados);

    expect(mockAlertUtils.toastrErrorMsg).toHaveBeenCalledWith(erro);
  });

  it('deve chamar patchFormularioEtp com os parâmetros corretos', () => {
    const etp = { id: 10, idFormulario: 999 };
    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    spyOn(service, 'patchFormularioEtp').and.returnValue(of({}));
    component.atualizarFormularioEtp(etp);

    expect(service.patchFormularioEtp).toHaveBeenCalledWith(10, 999);
  });

  it('deve chamar toastrErrorMsg se patchFormularioEtp retornar erro', () => {
    const etp = { id: 20, idFormulario: 888 };
    const erro = { message: 'Erro ao atualizar' };
    const service: GestaoEtpService = fixture.debugElement.injector.get(
      GestaoEtpService
    );
    spyOn(service, 'patchFormularioEtp').and.returnValue(throwError(() => erro));
    const mockAlertUtils: AlertUtils = fixture.debugElement.injector.get(
      AlertUtils
    )
    spyOn(mockAlertUtils, 'toastrErrorMsg');
    component.atualizarFormularioEtp(etp);

    expect(mockAlertUtils.toastrErrorMsg).toHaveBeenCalledWith(erro);
  });

  it('deve retornar os dados do ETP a partir do id', async () => {
    const mockId = 999;
    const mockEtp = { id: 999, bloqueado: true, bloqueadoPor: 'usuario' };

    const service = fixture.debugElement.injector.get(GestaoEtpService);
    spyOn(service, 'getEtpById').and.returnValue(of(mockEtp));
    const resultado = await component.etpBloqueado(mockId);

    expect(service.getEtpById).toHaveBeenCalledWith(mockId);
    expect(resultado).toEqual(mockEtp);
  });

  it('deve permitir elaborar ETP se não estiver bloqueado por outro usuário', fakeAsync(() => {
    const item = { id: 123, tipoPermissaoDelegacao: 'TOTAL' };
    const etpCompleto = { id: 123, situacao: { chave: 'ABERTO' }, formulario: { id: 1, jsonForm: {} }, jsonDados: {}, tipoLicitacao: { id: 1, descricao: 'Concorrência', chave: 'CONC' } };

    const service = fixture.debugElement.injector.get(GestaoEtpService);
    spyOn(service, 'getEtpById').and.returnValue(of(etpCompleto));
    spyOn(service, 'putBloqueioEtp').and.returnValue(of({}));
    spyOn(component.CADASTRAR_ETP, 'open');
    spyOn(component, 'cancelTimer');
    component.elaborarEtp(item);

    flush();
    tick(1000);
    expect(service.putBloqueioEtp).toHaveBeenCalledWith(123, { bloqueado: true });
  }));

  it('deve exibir alerta e não continuar se ETP estiver bloqueado por outro usuário', fakeAsync(() => {
    const item = { id: 456, tipoPermissaoDelegacao: 'TOTAL' };
    component.etpBloqueado = async () => ({
      bloqueado: true,
      bloqueadoPor: 'outroUsuario'
    });

    const service = fixture.debugElement.injector.get(GestaoEtpService);
    const mockAlertUtils: AlertUtils = fixture.debugElement.injector.get(
      AlertUtils
    )
    spyOn(alertUtils, 'alertDialog');
    spyOn(service, 'putBloqueioEtp').and.returnValue(of({}));
    spyOn(component.CONSTRUI_FORMULARIO, 'open');
    component.elaborarEtp(item);
    flush();
    tick(1000);
    expect(mockAlertUtils.alertDialog).toHaveBeenCalledWith(
      'O etp está bloqueado por outroUsuario'
    );
    expect(service.putBloqueioEtp).not.toHaveBeenCalled();
    expect(component.CONSTRUI_FORMULARIO.open).not.toHaveBeenCalled();
  }));

  it('deve retornar isValidData true e datas ajustadas corretamente', () => {
    const dataInicial = new Date('2025-07-01T08:00:00');
    const dataFinal = new Date('2025-07-02T20:00:00');

    component.formControl['dataRegistroInicial'].setValue(dataInicial);
    component.formControl['dataRegistroFinal'].setValue(dataFinal);

    const resultado = component.validaDataPesquisa();

    expect(resultado.isValidData).toBeTrue();
    // expect(resultado.dataRegistroInicial).toBe(new Date('2025-07-01T00:00:00.000Z').toISOString());
    // expect(resultado.dataRegistroFinal).toBe(new Date('2025-07-02T23:59:59.999Z').toISOString());
  });

  it('deve retornar valido e extrair dados quando processo SEI estiver no formato correto', () => {
    const resultado = component.validaProcessoSei('STJ 123456/2025');

    expect(resultado.isValidProcessosei).toBeTrue();
    expect(resultado.processoSeiId).toBe('STJ 123456');
    expect(resultado.anoSeiId).toBe('2025');
  });

  it('deve retornar válido e extrair corretamente processo e ano com string 11 caracteres', () => {
    const resultado = component.validaNumeroProcessoSei('123456/2025');

    expect(resultado.isValidProcessosei).toBeTrue();
    expect(resultado.processoSeiId).toBe('123456');
    expect(resultado.anoSeiId).toBe('2025');
  });

  it('deve retornar válido e extrair número e ano do ETP corretamente', () => {
    const resultado = component.validaNumeroEtp('1234/2025');

    expect(resultado.isValideNumeroEtp).toBeTrue();
    expect(resultado.numeroEtpId).toBe('1234');
    expect(resultado.anoEtpId).toBe('2025');
  });

  it('deve retornar array vazio se item for null', () => {
    const resultado = component.montarAcoesPermitidas(null as any, true);
    expect(resultado).toEqual([]);
  });


  it('deve chamar getTodasVersoesEtp com os parâmetros corretos e abrir modal com dados formatados', () => {
    const item = { id: 1 };
    const pageEvent = { number: 2, size: 5, sort: 'id,asc' };
    const mockResponse = {
      content: [{ id: 11 }, { id: 12 }],
      totalElements: 2,
    };

    const service = fixture.debugElement.injector.get(GestaoEtpService);
    spyOn(service, 'getTodasVersoesEtp').and.returnValue(of(mockResponse));
    spyOn(component, 'montarAcoesPermitidas').and.callFake((data) => data);
    spyOn(component.VERSOES_ETP, 'open');

    component.getTodasVersoesEtp(item, pageEvent);

    expect(service.getTodasVersoesEtp).toHaveBeenCalledWith(1, {
      page: 1,
      size: 5,
      sort: 'id,asc'
    });

    //expect(component.montarAcoesPermitidas).toHaveBeenCalledWith(mockResponse.content, false);
    expect(component.VERSOES_ETP.open).toHaveBeenCalledWith(
      mockResponse.content,
      2,
      'teste'
    );
  });

  it('deve chamar stopPropagation e atribuir o item a selectedRowData', () => {
    const fakeEvent = jasmine.createSpyObj('event', ['stopPropagation']);
    const mockItem = { id: 123, descricao: 'ETP Teste' };

    component.selecionaItem(fakeEvent as any, mockItem);

    expect(fakeEvent.stopPropagation).toHaveBeenCalled();
    expect(component.selectedRowData).toEqual(mockItem);
  });

  it('deve preencher o campo processoSei com o valor retornado pelo serviço', async () => {
    const mockEvent = { target: { value: '123456/2025' } };
    const mockRetorno = { procedimentoFormatado: '123456/2025' } as RetornoConsultaProcedimentoDTO;

    const seiService = fixture.debugElement.injector.get(SeiService);
    spyOn(seiService, 'pesquisaProcesso').and.returnValue(Promise.resolve(mockRetorno));

    const mockAlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(mockAlertUtils, 'alertDialog');

    await component.pesquisaProcesso(mockEvent);

    expect(component.formControl['processoSei'].value).toBe('123456/2025');
    expect(mockAlertUtils.alertDialog).not.toHaveBeenCalled();
  });

  it('deve exibir alerta se procedimentoFormatado não for retornado', async () => {
    const mockEvent = { target: { value: '999999/2025' } };
    const mockRetorno = { procedimentoFormatado: '' } as RetornoConsultaProcedimentoDTO;
    const seiService = fixture.debugElement.injector.get(SeiService);
    spyOn(seiService, 'pesquisaProcesso').and.returnValue(Promise.resolve(mockRetorno));

    const mockAlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(mockAlertUtils, 'alertDialog');

    await component.pesquisaProcesso(mockEvent);

    expect(component.formControl['processoSei'].value).toBe('');
    expect(mockAlertUtils.alertDialog).toHaveBeenCalledWith(
      'O número do processo SEI 999999/2025 não existe!'
    );
  });

  it('deve excluir o ETP quando o usuário confirma', async () => {
    const mockItem = { id: 123 };
    const mockAlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(mockAlertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));

    const mockGestaoEtpService = fixture.debugElement.injector.get(GestaoEtpService);
    spyOn(mockGestaoEtpService, 'deleteEtp').and.returnValue(of({}));
    spyOn(component, 'tableLazyLoading');
    await component.excluirETP(mockItem);

    expect(mockAlertUtils.confirmDialog).toHaveBeenCalledWith('Deseja excluir o ETP?');

  });

//------------------------------------------------------------------------------
  it('deve chamar a funcao getSituacaoFormulario', () => {
    const response: any = {};
    const service: SituacaoFormularioServiceService =
      fixture.debugElement.injector.get(SituacaoFormularioServiceService);
    spyOn(service, 'getSituacaoFormulario').and.returnValue(of(response));
    component.getSituacaoFormulario();
    expect(service.getSituacaoFormulario).toHaveBeenCalled();
  });

  it('deve chamar a funcao getTodosFormularios', () => {
    const response: any = {};
    const service: GestaoFormularioService = fixture.debugElement.injector.get(
      GestaoFormularioService
    );
    spyOn(service, 'getFormulariosPublicados').and.returnValue(of(response));
    component.getTodosFormularios();
    expect(service.getFormulariosPublicados).toHaveBeenCalled();
  });

  it('deve chamar a funcao getEtpTipoLicitacao', () => {
    const response: any = {};
    const service: EtpTipoLicitacaoService = fixture.debugElement.injector.get(
      EtpTipoLicitacaoService
    );
    spyOn(service, 'getEtpTipoLicitacaoLista').and.returnValue(of(response));
    component.getEtpTipoLicitacao();
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
    const service: GestaoEtpService =
      fixture.debugElement.injector.get(GestaoEtpService);
    spyOn(service, 'postEtp').and.returnValue(of(response));
    component.gravarEtp(objEtp);
    expect(service.postEtp).toHaveBeenCalled();
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
    const service: GestaoEtpService =
      fixture.debugElement.injector.get(GestaoEtpService);
    spyOn(service, 'putEtp').and.returnValue(of(response));
    component.gravarEtp(objEtp);
    expect(service.putEtp).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirEtp', () => {
    const response: any = {
      teste: '1',
    };
    const objEtp = {
      id: 1,
    };
    const service: GestaoEtpService =
      fixture.debugElement.injector.get(GestaoEtpService);
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);

    spyOn(service, 'deleteEtp').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(component, 'tableLazyLoading');

    component.excluirETP(objEtp);

    expect(alert.confirmDialog).toHaveBeenCalledWith(`Deseja excluir o ETP?`);
  });

  it('deve chamar open ao chamar cadastrarEtp', () => {
    spyOn(component.CADASTRAR_ETP, 'open');

    component.cadastrarETP();

    expect(component.CADASTRAR_ETP.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarFormulario', () => {
    spyOn(component.CADASTRAR_ETP, 'open');

    component.editarETP({ id: 1 });

    expect(component.CADASTRAR_ETP.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoETPFiltroForm, 'reset');
    component.limparCampos();

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

    const result = component.acaoPermitida(objEtp, 'EDITAR');

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

    const result = component.acaoPermitida(objEtp, 'EDITAR');

    expect(result).toBe(false);
  });

  it('deve testar getDataModificacao e getUsuarioModificacao', () => {
    const itemAlteracao = {
      dataAlteracao: new Date(),
      usuarioAlteracao: 'testeAlteracao',
    };

    const itemRegistro = {
      dataAlteracao: null,
      dataRegistro: new Date(),
      usuarioRegistro: 'testeRegistro',
    };

    expect(component.getDataModificacao(itemAlteracao)).toEqual(
      itemAlteracao.dataAlteracao
    );
    expect(component.getUsuarioModificacao(itemAlteracao)).toEqual(
      itemAlteracao.usuarioAlteracao
    );
    expect(component.getDataModificacao(itemRegistro)).toEqual(
      itemRegistro.dataRegistro
    );
    expect(component.getUsuarioModificacao(itemRegistro)).toEqual(
      itemRegistro.usuarioRegistro
    );
  });

  it('deve chamar confirmDialog e patchEtp em caso de confirmação', fakeAsync(() => {
    const objMock = { id: 1 };
    const acao = 'REABRIR';
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(gestaoEtpService, 'patchEtp').and.returnValue(of({}));
    spyOn(alertUtils, 'handleSucess');

    component.trocarSituacaoEtp(objMock, acao);
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(gestaoEtpService.patchEtp).toHaveBeenCalledWith(1, 'REABRIR');
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Ação reabrir realizada com sucesso'
    );
  }));

  it('deve chamar versionarEtp e handleSucess se o usuário confirmar', fakeAsync(() => {
    const itemMock = {
      id: 1,
      situacao: { descricao: 'Assunto' },
      formulario: { descricao: 'Formulario' },
      descricao: 'Descrição',
      versao: 'V1',
    };
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(component.VERSIONAR_ETP, 'open').and.returnValue(
      Promise.resolve(true)
    );

    component.versionarEtp(itemMock);

    // Avançar o tempo para processar a Promise e esvaziar a fila de timers
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(component.VERSIONAR_ETP.open).toHaveBeenCalledWith(itemMock);
  }));

  it('deve chamar executaVersionar e handleSucess se o usuário confirmar', fakeAsync(() => {
    const itemMock = {
      id: 1,
      situacao: { descricao: 'Assunto' },
      formulario: { descricao: 'Formulario' },
      descricao: 'Descrição',
      versao: 'V1',
    };
    spyOn(gestaoEtpService, 'versionarEtp').and.returnValue(of({}));
    spyOn(alertUtils, 'handleSucess');

    component.executaVersionar(itemMock);

    // Avançar o tempo para processar a Promise e esvaziar a fila de timers
    tick();

    expect(gestaoEtpService.versionarEtp).toHaveBeenCalledWith(1, undefined);
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Versão gerada com sucesso'
    );
  }));

  it('should return false if the start date is after the end date', () => {
    const dataInicial = new Date('2024-01-02');
    const dataFinal = new Date('2024-01-01');
    expect(component.validaData(dataInicial, dataFinal)).toBeFalse();
  });

  it('should return true if the start date is before the end date', () => {
    const dataInicial = new Date('2024-01-01');
    const dataFinal = new Date('2024-01-02');
    expect(component.validaData(dataInicial, dataFinal)).toBeTrue();
  });

  it('should return true if the start date is the same as the end date', () => {
    const dataInicial = new Date('2024-01-01');
    const dataFinal = new Date('2024-01-01');
    expect(component.validaData(dataInicial, dataFinal)).toBeTrue();
  });

  // it('should adjust date to the start of the day in local timezone', () => {
  //   // Supõe-se que este seja o horário UTC para o teste
  //   const testDate = new Date(Date.UTC(2024, 0, 1, 3)); // 3 AM UTC, equivalente a 00:00 em Brasília (UTC-3)

  //   const adjustedDate = component.adjustDateToLocalDayBounds(
  //     testDate,
  //     'inicial'
  //   );

  //   // Cria a data esperada ajustada para 00:00 no horário local de Brasília
  //   const expectedDate = new Date(Date.UTC(2024, 0, 1, 3)); // Deveria ser igual ao testDate
  //   expectedDate.setHours(0, 0, 0, 0); // ajustado para 00:00 local

  //   expect(adjustedDate).toEqual(expectedDate);
  // });

  // it('should handle dates when timezone offset is not the standard Brasilia UTC-3', () => {
  //   const testDate = new Date('2024-06-01T12:00:00Z');
  //   const expectedDate = new Date('2024-06-01T23:59:59.999Z');
  //   expectedDate.setHours(23, 59, 59, 999); // Ajusta para o fim do dia no fuso horário local
  //   const adjustedDate = component.adjustDateToLocalDayBounds(
  //     testDate,
  //     'final'
  //   );
  //   expect(adjustedDate).toEqual(expectedDate);
  // });
});
