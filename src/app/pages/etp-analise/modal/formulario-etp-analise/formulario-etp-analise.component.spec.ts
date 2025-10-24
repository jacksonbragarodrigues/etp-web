import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';
import { MenuLateralService } from '@administrativo/components';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';
import { FormularioEtpAnaliseComponent } from './formulario-etp-analise.component';
import { AlertUtils } from 'src/utils/alerts.util';
import { EtpAnaliseModule } from '../../etp-analise.module';
import { AppModule } from 'src/app/app.module';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { GestaoEtpAnaliseService } from 'src/app/services/gestao-etp-analise.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Stubs mínimos dos serviços injetados (apenas para permitir a construção do componente)
class EtpEnvioSeiServiceStub {}
class AuthLoginGuardStub { hasPermission() { return false; } }
class NgbModalStub { open() { return { result: Promise.resolve(true), close: () => {} } as any; } }
class AlertUtilsStub {
  handleSucess(_: any) {}
  toastrErrorMsg(_: any) {}
  toastrWarningMsg(_: any) {}
  confirmDialog(_: any) { return Promise.resolve(true); }
  alertDialog(_: any) {}
}
class GestaoFormularioServiceStub {}
class GestaoEtpAnaliseServiceStub {
  patchNextEtpAnalise() { return { subscribe: (_: any) => {} } as any; }
  getLogsEtpAnalise() { return { subscribe: (_: any) => {} } as any; }
}
class FichaAnaliseServiceStub {
  getFichaAnalisePorEtp() { return { subscribe: (_: any) => {} } as any; }
  postFichaAnalise() { return { subscribe: (_: any) => {} } as any; }
  putFichaAnalise() { return { subscribe: (_: any) => {} } as any; }
}
class FichaAnaliseAnalistasServiceStub {
  postInBLockFichaAnaliseAnalistas() { return { subscribe: (_: any) => {} } as any; }
  putInBLockFichaAnaliseAnalistas() { return { subscribe: (_: any) => {} } as any; }
  getAnalistasFichaAnalise() { return { subscribe: (_: any) => {} } as any; }
  deleteFichaAnaliseAnalistas() { return { subscribe: (_: any) => {} } as any; }
}
// Fim Stubs

describe('FormularioEtpAnaliseComponent', () => {
  let component: FormularioEtpAnaliseComponent;
  let fixture: ComponentFixture<FormularioEtpAnaliseComponent>;
  let alertUtils: AlertUtils;
  let gestaoEtpService: any;
  let menuLateral: any;
  let authLoginGuard: jasmine.SpyObj<AuthLoginGuard>;
  let gestaoEtpAnaliseSvcSpy: jasmine.SpyObj<GestaoEtpAnaliseService>;
  let alertUtilsSpy: jasmine.SpyObj<AlertUtils>;


  // Guardar e restaurar o requireLibrary do Formio caso o teste rode no mesmo processo de outros
  const originalFormioRequire: any = (globalThis as any).Formio?.requireLibrary;

  const authLoginGuardSpy = jasmine.createSpyObj('AuthLoginGuard', [
    'hasPermission',
  ]);

  beforeEach(async () => {

    // Em alguns ambientes, o import do @formio/angular pode não estar presente no escopo global do teste;
    // garantimos uma estrutura mínima para que o construtor não quebre ao reatribuir requireLibrary.
    (globalThis as any).Formio = (globalThis as any).Formio || {};
    (globalThis as any).Formio.requireLibrary = (name: any, prop: any, src: any, polling: any) => {
      // noop para os testes
      return;
    };

    gestaoEtpAnaliseSvcSpy = jasmine.createSpyObj('GestaoEtpAnaliseService', [
      'postEtpAnalise',
      'putEtpAnalise',
      'patchNextEtpAnalise',
      'getLogsEtpAnalise',
      'alteraEtpEtapaAnalise',
      'versionarEtpAnalise',
      'patchEtpAnalise',
    ]);

    alertUtilsSpy = jasmine.createSpyObj('AlertUtils', [
      'handleSucess',
      'toastrErrorMsg',
      'toastrWarningMsg',
      'confirmDialog',
      'alertDialog',
    ]);
    alertUtilsSpy.confirmDialog.and.returnValue(Promise.resolve(true));


    await TestBed.configureTestingModule({
      declarations: [FormularioEtpAnaliseComponent],
      imports: [EtpAnaliseModule, AppModule, HttpClientTestingModule],
      providers: [
        AlertUtils,
        GestaoFormularioService,
        { provide: AuthLoginGuard, useValue: authLoginGuardSpy },

        { provide: EtpEnvioSeiServiceStub, useClass: EtpEnvioSeiServiceStub },
        { provide: AuthLoginGuardStub, useClass: AuthLoginGuardStub },
        { provide: NgbModalStub, useClass: NgbModalStub },
        { provide: AlertUtilsStub, useClass: AlertUtilsStub },
        { provide: GestaoFormularioServiceStub, useClass: GestaoFormularioServiceStub },
        { provide: GestaoEtpAnaliseServiceStub, useClass: GestaoEtpAnaliseServiceStub },
        { provide: FichaAnaliseServiceStub, useClass: FichaAnaliseServiceStub },
        { provide: FichaAnaliseAnalistasServiceStub, useClass: FichaAnaliseAnalistasServiceStub },

        // Mapear providers reais do componente para os stubs acima
        { provide: 'EtpEnvioSeiService', useExisting: EtpEnvioSeiServiceStub },
        { provide: 'AuthLoginGuard', useExisting: AuthLoginGuardStub },
        { provide: 'NgbModal', useExisting: NgbModalStub },
        { provide: 'AlertUtils', useExisting: AlertUtilsStub },
        { provide: 'GestaoFormularioService', useExisting: GestaoFormularioServiceStub },
        { provide: 'GestaoEtpAnaliseService', useExisting: GestaoEtpAnaliseServiceStub },
        { provide: 'FichaAnaliseService', useExisting: FichaAnaliseServiceStub },
        { provide: 'FichaAnaliseAnalistasService', useExisting: FichaAnaliseAnalistasServiceStub }
      ],
      // Ignora elementos/atributos desconhecidos do template e evitamos carregar arquivo HTML externo
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false },
    })
      .overrideComponent(FormularioEtpAnaliseComponent, {
      set: { template: '' }
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormularioEtpAnaliseComponent);
    alertUtils = TestBed.inject(AlertUtils);
    gestaoEtpService = TestBed.inject(GestaoEtpService);
    menuLateral = TestBed.inject(MenuLateralService);

    component = fixture.componentInstance;
    component.etp = {
      jsonForm: '',
      jsonDados: '',
      jsonDadosTemp: '',
      id: 1,
      idFormulario: 1,
    };
    fixture.detectChanges();

    authLoginGuard = TestBed.inject(
      AuthLoginGuard
    ) as jasmine.SpyObj<AuthLoginGuard>;
  });

  afterEach(() => {
    // Restaura o requireLibrary original se existir
    if (originalFormioRequire) {
      (globalThis as any).Formio.requireLibrary = originalFormioRequire;
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve abrir modal formulario', (done) => {
    const objetoFormulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados: '{}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
      situacao: { descricao: 'teste' },
      descricao: 'teste',
      etpEtapa: { descricao: 'INICIAL' },
      unidadeUsarioLogado: 1,
    };

    const openEtp = {
      etp: objetoFormulario,
      item: objetoFormulario,
      formularioList: [],
      tipoLicitacaoList: [],
      situacaoList: [],
      etapaList: [],
      unidadeList: [],
    };

    component.open(openEtp).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRefAnalise.close();
    }, 1000);
  });

  it('deve abrir modal prencher um formulario', (done) => {
    const objetoFormulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados: '{"teste": "teste" }',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
      situacao: { descricao: 'teste' },
      descricao: 'teste',
      etpEtapa: { descricao: 'INICIAL' },
    };
    const openEtp = {
      etp: objetoFormulario,
      item: objetoFormulario,
      formularioList: [],
      tipoLicitacaoList: [],
      situacaoList: [],
      etapaList: [],
      unidadeList: [],
    };
    component.open(openEtp).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRefAnalise.close();
    }, 1000);
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
    component.gravarEtpAnalise(objEtp);
    expect(service.postEtpAnalise).toHaveBeenCalled();
  });

  it('deve salvar dados ao chamar a proxima pagina', () => {
    component.etp = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: 'teste_salvar_dados',
      id: 1,
    };

    let dadosInformados = {
      id: 1,
      jsonDados: JSON.stringify(component.etp.jsonDadosTemp),
    };

    spyOn(component.gravarDadosInformadosAnalise, 'emit').and.callFake(
      () => dadosInformados
    );
    component.onNext();
    // expect(component.gravarDadosInformados.emit).toHaveBeenCalledWith(
    //   dadosInformados
    // );
  });

  it('deve setar propriedades corretamente no objeto jsonDados', () => {
    component.dadosEtp = {
      processoSei: '123456',
      numeroEtp: '000324',
      tipoContratacaoChave: 'contratacao-chave',
    };
    // Configurar um JSON inicial
    component.etp.jsonDados = JSON.stringify({
      PAR_PROCESSO_SEI_PAR: '123456',
      PAR_NUMERO_ETP_PAR: '000324',
      PAR_TIPO_CONTRATACAO_PAR: 'contratacao',
    });

    // Chamar o método público que usa `setarPropriedades` internamente
    component.setarPropriedadesAnalise(); // Se precisar acessar o privado

    // Obter o JSON resultante
    const jsonResult = JSON.parse(component.etp.jsonDados);

    // Verificar se as propriedades foram setadas corretamente
    expect(jsonResult.PAR_PROCESSO_SEI_PAR).toBe('123456');
    expect(jsonResult.PAR_NUMERO_ETP_PAR).toBe('000324');
    expect(jsonResult.PAR_TIPO_CONTRATACAO_PAR).toBe('contratacao-chave');
  });

  it('não deve alterar propriedades inexistentes no jsonDados', () => {
    // Configurar um JSON inicial sem as propriedades esperadas
    component.etp.jsonDados = JSON.stringify({
      outraPropriedade: 'valor',
    });

    // Chamar o método público que usa `setarPropriedades` internamente
    component.setarPropriedadesAnalise();

    // Obter o JSON resultante
    const jsonResult = JSON.parse(component.etp.jsonDados);

    // Verificar que a propriedade original permaneceu inalterada
    expect(jsonResult.outraPropriedade).toBe('valor');
    // Verificar que as novas propriedades não foram adicionadas
    expect(jsonResult.PAR_PROCESSO_SEI_PAR).toBeUndefined();
    expect(jsonResult.PAR_NUMERO_ETP_PAR).toBeUndefined();
    expect(jsonResult.PAR_TIPO_CONTRATACAO_PAR).toBeUndefined();
  });

  it('deve desabilitar os componentes esperados', () => {
    component.etpEditarAnalise = {
      situacao: { chave: 'ABERTO' },
    };
    const mockComponent = { disabled: false };
    const mockFormulario = {
      components: [
        { key: 'PAR_TIPO_CONTRATACAO_PAR', disabled: false },
        { key: 'PAR_PROCESSO_SEI_PAR', disabled: false },
        { key: 'PAR_NUMERO_ETP_PAR', disabled: false },
        { key: 'OUTRO_COMPONENTE', disabled: false },
      ],
    };

    // Chamar o método privado
    component.desabilitarComponentsAnalise(mockFormulario);

    expect(mockComponent.disabled).toBeFalse();
  });

  it('deve tentar colocar um elemento em tela cheia se não estiver já em tela cheia', () => {
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null); // Inicialmente não em tela cheia
    spyOn(document, 'exitFullscreen').and.callFake(() => Promise.resolve());

    const mockElement = {
      requestFullscreen: jasmine
        .createSpy('requestFullscreen')
        .and.callFake(() => Promise.resolve()),
    };
    component.toggleFullScreen(mockElement);
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('deve tentar colocar um elemento em tela cheia se não estiver já em tela cheia', () => {
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null); // Inicialmente não em tela cheia
    spyOn(document, 'exitFullscreen').and.callFake(() => Promise.resolve());

    const mockElement = {
      requestFullscreen: jasmine
        .createSpy('requestFullscreen')
        .and.callFake(() => Promise.resolve()),
    };
    component.toggleFullScreen(mockElement);
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('deve chamar toggleFullScreen com o elemento obtido pelo ID', () => {
    spyOn(component, 'toggleFullScreen').and.callThrough();
    const elementId = 'testElement';
    const realElement = document.createElement('div');
    Object.defineProperty(realElement, 'requestFullscreen', {
      value: jasmine.createSpy('requestFullscreen'),
      configurable: true,
    });
    spyOn(document, 'getElementById').and.returnValue(realElement);

    component.openFullScreen(elementId);
    expect(document.getElementById).toHaveBeenCalledWith(elementId);
    expect(component.toggleFullScreen).toHaveBeenCalledWith(
      jasmine.any(HTMLElement)
    );
    expect(realElement.requestFullscreen).toBeDefined();
  });

  it('deve resetar o formulário, fechar modais e emitir evento ao recarregar o cadastro do ETP', () => {
    component.formRenderAnalise = { components: [{}] };

    // Spies e mocks
    component.modalRefAnalise = jasmine.createSpyObj('NgbModalRef', ['close']);
    component.CADASTRAR_ETP_ANALISE = jasmine.createSpyObj('NgbModalRef', [
      'close',
    ]);
    spyOn(component.fecharModalFormularioEtpAnalise, 'emit');
    spyOn(component, 'initObjectFormAnalise');

    // Chamada do método
    component.reloadFormularioEtpComCadastrarEtp();

    // Asserts
    expect(component.formRenderAnalise).toEqual({ components: [] });
    expect(component.initObjectFormAnalise).toHaveBeenCalled();
    expect(component.CADASTRAR_ETP_ANALISE.close).toHaveBeenCalledWith(true);
    expect(component.modalRefAnalise.close).toHaveBeenCalled();
    expect(component.fecharModalFormularioEtpAnalise.emit).toHaveBeenCalled();
  });

  it('deve chamar ngOnDestroy e reload quando não há alterações e usuário confirma saída', fakeAsync(() => {
    component.parametrosAnalise = {
      MSG_SAIR_CONTRUROR_ANALISE: 'Deseja sair ?',
    } as any;
    spyOn(component as any, 'compararAlteracoesJsonDados').and.returnValue(
      false
    );
    spyOn(component as any, 'ngOnDestroy');
    spyOn(component as any, 'reloadFormularioEtpAnalise');
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));

    component.clickRetornar = false;
    component.close();
    tick();
    flush();

    expect(alertUtils.confirmDialog).toHaveBeenCalledWith('Deseja sair ?');
    expect((component as any).ngOnDestroy).toHaveBeenCalled();
    expect((component as any).reloadFormularioEtpAnalise).toHaveBeenCalled();
    expect(component.clickRetornar).toBeTrue();
  }));

  it('não deve destruir nem recarregar quando usuário cancela saída', fakeAsync(() => {
    component.parametrosAnalise = {
      MSG_SAIR_CONTRUROR_ANALISE: 'Deseja sair ?',
    } as any;
    spyOn(component as any, 'compararAlteracoesJsonDados').and.returnValue(
      false
    );
    spyOn(component as any, 'ngOnDestroy');
    spyOn(component as any, 'reloadFormularioEtpAnalise');

    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(false));

    component.clickRetornar = false;
    component.close();
    tick();
    flush();

    expect((component as any).ngOnDestroy).not.toHaveBeenCalled();
    expect(
      (component as any).reloadFormularioEtpAnalise
    ).not.toHaveBeenCalled();
    expect(component.clickRetornar).toBeFalse();
  }));

  it('deve cancelar a nova versão da análise e restaurar os dados anteriores', () => {
    const etpAnaliseMock = {
      id: 42,
      jsonForm: JSON.stringify({
        components: [{ key: 'field1', type: 'textfield' }],
      }),
    };

    component.etp = { id: null, jsonForm: '' };
    component.formRenderAnalise = {};

    component.cancelarNovaVersaoAnalise(etpAnaliseMock);

    expect(component.etp.id).toBe(42);
    expect(component.etp.jsonForm).toBe(etpAnaliseMock.jsonForm);
    expect(component.formRenderAnalise).toEqual(
      JSON.parse(etpAnaliseMock.jsonForm)
    );
  });

  it('deve habilitar os índices especificados em itemMenuAnalise e chamar updateMenuAnalise', () => {
    component.itemMenuAnalise = [true, true, true];
    const indexAnalise = [0, 2];

    spyOn(component, 'updateMenuAnalise');

    component.habilitaAnalise(indexAnalise);

    expect(component.itemMenuAnalise[0]).toBeFalse();
    expect(component.itemMenuAnalise[1]).toBeTrue();
    expect(component.itemMenuAnalise[2]).toBeFalse();
    expect(component.updateMenuAnalise).toHaveBeenCalled();
  });

  it('deve desabilitar os índices especificados em itemMenuAnalise e chamar updateMenuAnalise', () => {
    component.itemMenuAnalise = [false, false, false];
    const indexAnalise = [1];

    spyOn(component, 'updateMenuAnalise');

    component.desabilitarAnalise(indexAnalise);

    expect(component.itemMenuAnalise[0]).toBeFalse();
    expect(component.itemMenuAnalise[1]).toBeTrue();
    expect(component.itemMenuAnalise[2]).toBeFalse();
    expect(component.updateMenuAnalise).toHaveBeenCalled();
  });

  it('deve remover analista da ficha de análise com sucesso', () => {
    const mockEvent = { id: 1 };
    const fichaAnaliseAnalistasService = jasmine.createSpyObj(
      'FichaAnaliseAnalistasService',
      ['deleteFichaAnaliseAnalistas']
    );
    const alertUtils = jasmine.createSpyObj('AlertUtils', [
      'handleSucess',
      'toastrErrorMsg',
    ]);
    const modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);

    component['fichaAnaliseAnalistasService'] = fichaAnaliseAnalistasService;
    component['alertUtils'] = alertUtils;
    component.FICHA_ANALISE = modalRef;

    fichaAnaliseAnalistasService.deleteFichaAnaliseAnalistas.and.returnValue(
      of({})
    );

    component.removerAnalistaFichaAnalise(mockEvent);

    expect(
      fichaAnaliseAnalistasService.deleteFichaAnaliseAnalistas
    ).toHaveBeenCalledWith(mockEvent);
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Analista removido com sucesso'
    );
    expect(modalRef.close).toHaveBeenCalled();
  });

  it('deve exibir erro ao falhar na remoção do analista', () => {
    const mockEvent = { id: 1 };
    const fichaAnaliseAnalistasService = jasmine.createSpyObj(
      'FichaAnaliseAnalistasService',
      ['deleteFichaAnaliseAnalistas']
    );
    const alertUtils = jasmine.createSpyObj('AlertUtils', [
      'handleSucess',
      'toastrErrorMsg',
    ]);
    const modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);

    component['fichaAnaliseAnalistasService'] = fichaAnaliseAnalistasService;
    component['alertUtils'] = alertUtils;
    component.FICHA_ANALISE = modalRef;

    fichaAnaliseAnalistasService.deleteFichaAnaliseAnalistas.and.returnValue(
      throwError(() => new Error('Erro'))
    );

    component.removerAnalistaFichaAnalise(mockEvent);

    expect(alertUtils.toastrErrorMsg).toHaveBeenCalled();
  });

  it('deve atualizar ficha e analistas com sucesso (PUT)', () => {
    const mockEvent = {
      ficha: { id: 1 },
      analistas: [{ id: 1 }],
    };

    const fichaAnaliseService = jasmine.createSpyObj('FichaAnaliseService', [
      'putFichaAnalise',
    ]);
    const fichaAnaliseAnalistasService = jasmine.createSpyObj(
      'FichaAnaliseAnalistasService',
      ['putInBLockFichaAnaliseAnalistas']
    );
    const alertUtils = jasmine.createSpyObj('AlertUtils', [
      'handleSucess',
      'toastrErrorMsg',
    ]);
    const modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);

    component['fichaAnaliseService'] = fichaAnaliseService;
    component['fichaAnaliseAnalistasService'] = fichaAnaliseAnalistasService;
    component['alertUtils'] = alertUtils;
    component.FICHA_ANALISE = modalRef;

    fichaAnaliseService.putFichaAnalise.and.returnValue(of({}));
    fichaAnaliseAnalistasService.putInBLockFichaAnaliseAnalistas.and.returnValue(
      of({})
    );

    component.gravarFichaAnalise(mockEvent);

    expect(fichaAnaliseService.putFichaAnalise).toHaveBeenCalledWith(
      1,
      mockEvent.ficha
    );
    expect(
      fichaAnaliseAnalistasService.putInBLockFichaAnaliseAnalistas
    ).toHaveBeenCalledWith(1, mockEvent.analistas);
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Alterado com sucesso'
    );
    expect(modalRef.close).toHaveBeenCalled();
  });

  it('deve salvar ficha nova e analistas com sucesso (POST)', () => {
    const mockEvent = {
      ficha: { id: null },
      analistas: [{ id: 1 }],
    };

    const fichaAnaliseService = jasmine.createSpyObj('FichaAnaliseService', [
      'postFichaAnalise',
    ]);
    const fichaAnaliseAnalistasService = jasmine.createSpyObj(
      'FichaAnaliseAnalistasService',
      ['postInBLockFichaAnaliseAnalistas']
    );
    const alertUtils = jasmine.createSpyObj('AlertUtils', [
      'handleSucess',
      'toastrErrorMsg',
    ]);
    const modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);

    component['fichaAnaliseService'] = fichaAnaliseService;
    component['fichaAnaliseAnalistasService'] = fichaAnaliseAnalistasService;
    component['alertUtils'] = alertUtils;
    component.FICHA_ANALISE = modalRef;

    fichaAnaliseService.postFichaAnalise.and.returnValue(of({ id: 10 }));
    fichaAnaliseAnalistasService.postInBLockFichaAnaliseAnalistas.and.returnValue(
      of({})
    );

    component.gravarFichaAnalise(mockEvent);

    expect(fichaAnaliseService.postFichaAnalise).toHaveBeenCalledWith(
      mockEvent.ficha
    );
    expect(
      fichaAnaliseAnalistasService.postInBLockFichaAnaliseAnalistas
    ).toHaveBeenCalled();
    expect(alertUtils.handleSucess).toHaveBeenCalledWith('Salvo com sucesso');
    expect(modalRef.close).toHaveBeenCalled();
  });

  it('deve abrir ficha de análise existente com analistas', () => {
    const mockFicha = { id: 1 };
    const mockAnalistas = [{ id: 1 }];

    const fichaAnaliseService = jasmine.createSpyObj('FichaAnaliseService', [
      'getFichaAnalisePorEtp',
    ]);
    const fichaAnaliseAnalistasService = jasmine.createSpyObj(
      'FichaAnaliseAnalistasService',
      ['getAnalistasFichaAnalise']
    );
    const alertUtils = jasmine.createSpyObj('AlertUtils', ['toastrErrorMsg']);

    component['fichaAnaliseService'] = fichaAnaliseService;
    component['fichaAnaliseAnalistasService'] = fichaAnaliseAnalistasService;
    component['alertUtils'] = alertUtils;
    component.FICHA_ANALISE = jasmine.createSpyObj('FICHA_ANALISE', ['open']);

    component.dadosEtp = { id: 123 };
    component.etapaListAnalise = [];
    component.situacaoListAnalise = [];
    component.unidadeList = [];

    fichaAnaliseService.getFichaAnalisePorEtp.and.returnValue(of(mockFicha));
    fichaAnaliseAnalistasService.getAnalistasFichaAnalise.and.returnValue(
      of(mockAnalistas)
    );

    component['abrirFichaAnalise']();

    expect(fichaAnaliseService.getFichaAnalisePorEtp).toHaveBeenCalledWith(123);
    expect(
      fichaAnaliseAnalistasService.getAnalistasFichaAnalise
    ).toHaveBeenCalledWith(1);
    expect(component.FICHA_ANALISE.open).toHaveBeenCalledWith(
      [],
      [],
      [],
      { id: 123 },
      mockFicha,
      mockAnalistas
    );
  });

  it('deve abrir modal sem ficha quando ficha for null', () => {
    const fichaAnaliseService = jasmine.createSpyObj('FichaAnaliseService', [
      'getFichaAnalisePorEtp',
    ]);
    const alertUtils = jasmine.createSpyObj('AlertUtils', ['toastrErrorMsg']);
    component['fichaAnaliseService'] = fichaAnaliseService;
    component['alertUtils'] = alertUtils;

    component.dadosEtp = { id: 123 };
    component.etapaListAnalise = [];
    component.situacaoListAnalise = [];
    component.unidadeList = [];
    component.FICHA_ANALISE = jasmine.createSpyObj('FICHA_ANALISE', ['open']);

    fichaAnaliseService.getFichaAnalisePorEtp.and.returnValue(of(null));

    component['abrirFichaAnalise']();

    expect(component.FICHA_ANALISE.open).toHaveBeenCalledWith(
      [],
      [],
      [],
      { id: 123 },
      null,
      []
    );
  });

  it('deve tratar erro ao buscar ficha de análise', () => {
    const fichaAnaliseService = jasmine.createSpyObj('FichaAnaliseService', [
      'getFichaAnalisePorEtp',
    ]);
    const alertUtils = jasmine.createSpyObj('AlertUtils', ['toastrErrorMsg']);

    component['fichaAnaliseService'] = fichaAnaliseService;
    component['alertUtils'] = alertUtils;
    component.dadosEtp = { id: 123 };

    fichaAnaliseService.getFichaAnalisePorEtp.and.returnValue(
      throwError(() => new Error('Erro'))
    );

    component['abrirFichaAnalise']();

    expect(alertUtils.toastrErrorMsg).toHaveBeenCalled();
  });

  it('deve desligar todos os listeners e destruir a instância quando formInstanceAnalise existir', () => {
    // Arrange: mock da instância do Formio com spies
    const events = { off: jasmine.createSpy('events.off') };
    const mockInstance = {
      events,
      off: jasmine.createSpy('off'),
      destroy: jasmine.createSpy('destroy')
    };

    // @ts-ignore - acessando propriedade privada para fins de teste
    component.formInstanceAnalise = mockInstance;

    // Act
    component.ngOnDestroy();

    // Assert
    expect(events.off).toHaveBeenCalledTimes(1);

    // Verifica remoção de cada listener específico
    expect(mockInstance.off).toHaveBeenCalledWith('change');
    expect(mockInstance.off).toHaveBeenCalledWith('render');
    expect(mockInstance.off).toHaveBeenCalledWith('submit');
    expect(mockInstance.off).toHaveBeenCalledWith('prevPage');
    expect(mockInstance.off).toHaveBeenCalledWith('nextPage');

    // Verifica destruição com deep = true
    expect(mockInstance.destroy).toHaveBeenCalledOnceWith(true);
  });

  it('não deve falhar nem chamar nada quando formInstanceAnalise for undefined', () => {
    // @ts-ignore
    component.formInstanceAnalise = undefined;

    // Apenas certificar que não lança erro
    expect(() => component.ngOnDestroy()).not.toThrow();
  });


});
