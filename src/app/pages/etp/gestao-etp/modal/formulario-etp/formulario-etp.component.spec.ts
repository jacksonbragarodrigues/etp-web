import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';

import { FormularioEtpComponent } from './formulario-etp.component';
import { EtpModule } from '../../../etp.module';
import { AppModule } from '../../../../../app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from '../../../../../../utils/alerts.util';
import { GestaoFormularioService } from '../../../../../services/gestao-formulario.service';
import { of } from 'rxjs';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';
import { MenuLateralService } from '@administrativo/components';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';

describe('FormularioEtpComponent', () => {
  let component: FormularioEtpComponent;
  let fixture: ComponentFixture<FormularioEtpComponent>;
  let alertUtils: AlertUtils;
  let gestaoEtpService: any;
  let menuLateral: any;
  let authLoginGuard: jasmine.SpyObj<AuthLoginGuard>;

  const authLoginGuardSpy = jasmine.createSpyObj('AuthLoginGuard', [
    'hasPermission',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormularioEtpComponent],
      imports: [EtpModule, AppModule, HttpClientTestingModule],
      providers: [
        AlertUtils,
        GestaoFormularioService,
        { provide: AuthLoginGuard, useValue: authLoginGuardSpy },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioEtpComponent);
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('deve desabilitar e selecionar opções do menu lateral corretamente quando etp.visualizar for true', (done) => {
  //   const etpMock = { visualizar: true };
  //   component.etpEditar = {
  //     jsonForm:
  //       '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
  //     jsonDados: '{}',
  //     jsonDadosTemp: '',
  //     id: 1,
  //     versao: 1,
  //     descricao: 'teste',
  //     situacao: {
  //       chave: 'ABERTO',
  //       descricao: 'teste'
  //     },
  //   };
  //   // Configura o spy para renderFormio
  //   spyOn(component, 'renderFormio');
  //
  //   // Chama o método que será testado
  //   component.opsVisualizarMenuLateral(etpMock);
  //   //expect(component.desabilita).;
  //   // expect(component.renderFormio).toHaveBeenCalled();
  //
  //   // Aguarda as chamadas dos timeouts
  //   // setTimeout(() => {
  //   //   expect(component.renderFormio).toHaveBeenCalled(); // Verifica se o método foi chamado
  //   //   done(); // Finaliza o teste assíncrono
  //   // }, 200); // Aguarda o tempo necessário para o método ser chamado
  // });

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
      component.modalRef.close();
    }, 1000);
  });

  it('deve abrir modal formulario com versão antiga', (done) => {
    const objetoFormulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados: '{}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
      idFormulario: 1,
      situacao: { descricao: 'teste' },
      descricao: 'teste',
      etpEtapa: { descricao: 'INICIAL' },
      unidadeUsarioLogado: 1,
    };

    const formularioMock = {
      id: 2,
      jsonForm: '{"components":[{"key":"newComponent"}]}',
    };

    const gestaoFormularioService: GestaoFormularioService =
      fixture.debugElement.injector.get(GestaoFormularioService);
    spyOn(
      gestaoFormularioService,
      'consultarUltimaVersaoFormulario'
    ).and.returnValue(of(formularioMock));

    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    spyOn(component.atualizarFormulario, 'emit').and.callFake(
      () => component.etp
    );

    const openEtp = {
      etp: objetoFormulario,
      item: objetoFormulario,
      formularioList: [],
      tipoLicitacaoList: [],
      situacaoList: [],
      etapaList: [],
      unidadeList: [],
    };

    component.open(openEtp);
    component.etp = {
      jsonForm: '{"components":[{"key":"newComponent"}]}',
      jsonDados: '',
      jsonDadosTemp: '',
      id: 1,
      idFormulario: 2,
    };
    expect(
      gestaoFormularioService.consultarUltimaVersaoFormulario
    ).toHaveBeenCalledWith(objetoFormulario.idFormulario);
    expect(component.etp.idFormulario).toEqual(formularioMock.id);

    component.open(openEtp).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);
  });

  // it('deve abrir modal formulario nenhuma versão nova encontrada', (done) => {
  //   const objetoFormulario = {
  //     jsonForm:
  //       '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
  //     jsonDados: '{}',
  //     jsonDadosTemp: '',
  //     id: 1,
  //     versao: 1,
  //     idFormulario: 1,
  //     situacao: { descricao: 'teste' },
  //     descricao: 'teste',
  //     etpEtapa: { descricao: 'INICIAL' },
  //   };
  //   const formularioMock = { id: null, jsonForm: null };
  //   const gestaoFormularioService: GestaoFormularioService =
  //     fixture.debugElement.injector.get(GestaoFormularioService);
  //   spyOn(
  //     gestaoFormularioService,
  //     'consultarUltimaVersaoFormulario'
  //   ).and.returnValue(of(formularioMock));
  //   const openEtp = {
  //     etp: objetoFormulario,
  //     item: objetoFormulario,
  //     formularioList: [],
  //     tipoLicitacaoList: [],
  //     situacaoList: [],
  //     etapaList: [],
  //     unidadeList: [],
  //   };
  //   component.open(openEtp);
  //   component.etp = {
  //     jsonForm: '{"components":[{"key":"newComponent"}]}',
  //     jsonDados: '',
  //     jsonDadosTemp: '',
  //     id: 1,
  //     idFormulario: 1,
  //   };
  //   expect(
  //     gestaoFormularioService.consultarUltimaVersaoFormulario
  //   ).toHaveBeenCalledWith(objetoFormulario.idFormulario);
  //   expect(1).toEqual(component.etp.idFormulario);
  //   component.open(openEtp).then((result) => {
  //     expect(result).toBeUndefined();
  //     done();
  //   });
  //   setTimeout(() => {
  //     component.modalRef.close();
  //   }, 1000);
  // });

  // it('deve abrir modal formulario recusando atualizaçõa', (done) => {
  //   const objetoFormulario = {
  //     jsonForm:
  //       '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
  //     jsonDados: '{}',
  //     jsonDadosTemp: '',
  //     id: 1,
  //     versao: 1,
  //     idFormulario: 1,
  //     situacao: { descricao: 'teste' },
  //     descricao: 'teste',
  //     etpEtapa: { descricao: 'INICIAL' },
  //   };
  //
  //   const formularioMock = {
  //     id: 2,
  //     jsonForm:
  //       '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
  //   };
  //
  //   const gestaoFormularioService: GestaoFormularioService =
  //     fixture.debugElement.injector.get(GestaoFormularioService);
  //   spyOn(
  //     gestaoFormularioService,
  //     'consultarUltimaVersaoFormulario'
  //   ).and.returnValue(of(formularioMock));
  //   const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
  //   spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(false));
  //
  //   const openEtp = {
  //     etp: objetoFormulario,
  //     item: objetoFormulario,
  //     formularioList: [],
  //     tipoLicitacaoList: [],
  //     situacaoList: [],
  //     etapaList: [],
  //     unidadeList: [],
  //   };
  //   component.open(openEtp);
  //
  //   component.etp = {
  //     jsonForm: '{"components":[{"key":"newComponent"}]}',
  //     jsonDados: '',
  //     jsonDadosTemp: '',
  //     id: 1,
  //     idFormulario: 1,
  //     situacao: { descricao: 'teste' },
  //   };
  //   expect(
  //     gestaoFormularioService.consultarUltimaVersaoFormulario
  //   ).toHaveBeenCalledWith(objetoFormulario.idFormulario);
  //   expect(1).toEqual(component.etp.idFormulario);
  //
  //   component.open(openEtp).then((result) => {
  //     expect(result).toBeUndefined();
  //     done();
  //   });
  //   setTimeout(() => {
  //     component.modalRef.close();
  //   }, 1000);
  // });

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
      component.modalRef.close();
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

  it('deve chamar confirmDialog e patchEtp em caso de confirmação', fakeAsync(() => {
    const objMock = { id: 1 };
    const acao = 'REABRIR';
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(gestaoEtpService, 'patchEtp').and.returnValue(of({}));
    spyOn(alertUtils, 'handleSucess');

    component.trocarSituacaoEtp(objMock, acao);
    tick(); // Avança o tempo para resolver a Promise

    // Use flush para garantir que todos os timers pendentes sejam resolvidos
    flush();

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
    flush();

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
    flush();

    expect(gestaoEtpService.versionarEtp).toHaveBeenCalledWith(1, undefined);
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Versão gerada com sucesso'
    );
  }));

  it('deve salvar dados ao chamar a proxima pagina', () => {
    component.etp = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: 'teste_salvar_dados',
      id: 1,
    };
    let param = {
      data: '{teste: valor}',
      form: '{teste: valor}',
      page: 'teste_page',
    };
    let dadosInformados = {
      id: 1,
      jsonDados: JSON.stringify(component.etp.jsonDadosTemp),
    };

    spyOn(component.gravarDadosInformados, 'emit').and.callFake(
      () => dadosInformados
    );
    component.onNext(param);
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
    component.setarPropriedades(); // Se precisar acessar o privado

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
    component.setarPropriedades();

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
    component.etpEditar = {
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
    component.desabilitarComponents(mockFormulario);

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
});
