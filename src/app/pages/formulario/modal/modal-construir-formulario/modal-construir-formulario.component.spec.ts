import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppModule } from '../../../../app.module';
import { PrincipalModule } from '../../../principal/principal.module';
import { ModalConstruirFormularioComponent } from './modal-construir-formulario.component';
import { AlertUtils } from '../../../../../utils/alerts.util';
import { GestaoFormularioService } from '../../../../services/gestao-formulario.service';
import { of, throwError } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';
import { NotificacaoService } from '@administrativo/components';

describe('ModalConstruirFormularioComponent', () => {
  let component: ModalConstruirFormularioComponent;
  let fixture: ComponentFixture<ModalConstruirFormularioComponent>;
  let alertUtils: AlertUtils;
  let gestaoFormularioService: GestaoFormularioService;
  let modalRefSpy: jasmine.SpyObj<any>;
  let authLoginGuard: jasmine.SpyObj<AuthLoginGuard>;

  const authLoginGuardSpy = jasmine.createSpyObj('AuthLoginGuard', ['hasPermission']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalConstruirFormularioComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [
        AlertUtils,
        GestaoFormularioService,
        { provide: NgbModalRef, useValue: modalRefSpy },
        { provide: AuthLoginGuard, useValue: authLoginGuardSpy },
        { provide: NotificacaoService, useValue: jasmine.createSpyObj('NotificacaoService', ['notify']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConstruirFormularioComponent);
    alertUtils = TestBed.inject(AlertUtils);
    gestaoFormularioService = TestBed.inject(GestaoFormularioService);
    modalRefSpy = TestBed.inject(NgbModalRef) as jasmine.SpyObj<any>;

    component = fixture.componentInstance;
    component.formulario = { jsonForm: '{}' };
    fixture.detectChanges();
    authLoginGuard = TestBed.inject(AuthLoginGuard) as jasmine.SpyObj<AuthLoginGuard>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve abrir modal criar um form', (done) => {
    const objetoFormulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados: '',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    component.open(objetoFormulario).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);
  });
  it('deve abrir modal alterar um form', (done) => {
    const objetoFormulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados: '',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    component.open(objetoFormulario).then((result) => {
      expect(component.parametros.IS_SALVAR).toBeFalse();
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);
  });
  it('deve salvar o formualrio que esta no construtor', () => {
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados: '',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    component.preSaveRender();
    expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
      'Deseja gravar as informações ?'
    );
  });
  it('deve alterar o formualrio que esta no construtor', () => {
    component.parametros.IS_SALVAR = false;
    component.formulario = {
      jsonForm: '{"display": "wizard","page": 0,"numPages": 2}',
      jsonDados: 'dados',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    component.preSaveRender();
    expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
      'Deseja gravar as informações ?'
    );
  });
  it('deve salvar o formulario que esta no renderizador', () => {
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    component.preSaveRender();

    expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
      'Deseja gravar as informações ?'
    );
  });

  it('deve fechar a modal com sucesso', () => {
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);

    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    component.close();
    expect(alertUtils.confirmDialog).toHaveBeenCalledWith('Deseja sair ?');
  });
  it('deve fechar modal de contrução de formulario', () => {
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    let modalRef = {
      close: jasmine.createSpy('close'),
      result: Promise.resolve('Success'),
    } as any;
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    component.modalRef = modalRef;
    component.close();
    expect(alertUtils.confirmDialog).toHaveBeenCalledWith('Deseja sair ?');
  });
  it('deve salvar as informações adicionadas no construtor para selectboxes', () => {
    let event = {
      form: '{teste: valor}',
      component: {
        type: 'selectboxes',
        label: 'teste',
      },
    };
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    component.onChangeBuilder(event);

    let valor = JSON.stringify(event.form);
    expect(component.formulario.jsonForm).toEqual(valor);
  });
  it('deve salvar as informações adicionadas no construtor para selectboxes', () => {
    let event = {
      form: '{teste: valor}',
      component: {
        type: 'selectboxes',
        label: 'teste',
      },
    };
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    component.onChangeBuilder(event);
    let valor = JSON.stringify(event.form);
    expect(component.formulario.jsonForm).toEqual(valor);
  });
  it('deve salvar as informações adicionadas no construtor para panels', () => {
    let event = {
      form: '{teste: valor}',
      component: {
        type: 'panel',
        label: 'teste',
      },
    };
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    component.onChangeBuilder(event);
    let valor = JSON.stringify(event.form);
    expect(component.formulario.jsonForm).toEqual(valor);
  });
  it('deve salvar as informações adicionadas no construtor para tabs', () => {
    let event = {
      form: '{teste: valor}',
      component: {
        type: 'tabs',
        label: 'teste',
      },
    };
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    component.onChangeBuilder(event);
    let valor = JSON.stringify(event.form);
    expect(component.formulario.jsonForm).toEqual(valor);
  });
  it('deve realizar a transição de abas do formulario renderizado', () => {
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    let param = {
      data: '{teste: valor}',
      form: '{teste: valor}',
      isValid: () => {
        return true;
      },
    };

    component.onChangeRenderer(param);
    expect(component.formulario.jsonDadosTemp).toEqual(param.data);
    expect(component.pageRender).toEqual(undefined);
  });

  it('não deve realizar a transição de abas do formulario renderizado', () => {
    let param = {
      data: '{teste: valor}',
      form: '{teste: valor}',
      page: 'teste_page',
      isValid: () => {
        return false;
      },
      setPage: (page: any) => {
        page = page;
      },
    };
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: '',
      id: 1,
      versao: 1,
    };
    component.pageRender = 'teste_page';
    component.onChangeRenderer(param);
    expect(component.pageRender).toEqual(param.page);
  });
  it('não deve realizar as validações', () => {
    let param = {
      data: undefined,
      form: undefined,
      page: undefined,
      isValid: () => {
        return false;
      },
      setPage: (page: any) => {
        page = page;
      },
    };
    component.pageRender = undefined;
    component.dados = '';
    component.onChangeRenderer(param);
    expect(component.pageRender).toEqual(undefined);
  });
  it('deve salvar dados ao chamar a proxima pagina', () => {
    component.formulario = {
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      jsonDados:
        '{"textField2":"","par_num_processo_par":"345","textField":"","unidadeselect":""}',
      jsonDadosTemp: 'teste_salvar_dados',
      id: 1,
      versao: 1,
    };
    let param = {
      data: '{teste: valor}',
      form: '{teste: valor}',
      page: 'teste_page',
    };
    let dadosInformados = {
      id: 1,
      jsonDados: JSON.stringify(component.formulario.jsonDadosTemp),
    };

    spyOn(component.gravarDadosInformados, 'emit').and.callFake(
      () => dadosInformados
    );
    component.onNext(param);
    expect(component.gravarDadosInformados.emit).toHaveBeenCalledWith(
      dadosInformados
    );
  });

  it('deve mudar o texto do botão para "Fechar" se o texto original for "Salvar"', () => {
    let button = document.createElement('button');
    button.textContent = 'Salvar';
    component.updateButton(button);
    expect(button.textContent).toBe('Fechar');
  });

  it('deve atualizar o rótulo e o título se estiverem na lista labelInit', () => {
    const event = { component: { label: 'Table', title: 'Table' } };
    component.updateComponentLabels(event);
    expect(event.component.label).toBe('Digite o rótulo');
    expect(event.component.title).toBe('Digite o rótulo');
  });

  it('deve substituir "Content" por "&nbsp;" no título e no rótulo', () => {
    const event = { component: { label: 'Content', title: 'Content' } };
    component.updateComponentLabels(event);
    expect(event.component.title).toBe('&nbsp;');
    expect(event.component.label).toBe('&nbsp;');
  });

  it('deve definir pageRender como undefined se param é válido', () => {
    const param = {
      isValid: () => true,
      setPage: jasmine.createSpy('setPage'),
      page: 1,
    };
    component.pageRender = 5;
    component.onChangePages(param);
    expect(component.pageRender).toBeUndefined();
    expect(param.setPage).not.toHaveBeenCalled();
  });

  it('deve chamar setPage se param não é válido e pageRender é definido', () => {
    const param = {
      isValid: () => false,
      setPage: jasmine.createSpy('setPage'),
      page: 2,
    };
    component.pageRender = 3;
    component.onChangePages(param);
    expect(param.setPage).toHaveBeenCalledWith(3);
  });

  it('deve definir pageRender para o valor de param.page se param não é válido e pageRender é undefined', () => {
    const param = {
      isValid: () => false,
      setPage: jasmine.createSpy('setPage'),
      page: 4,
    };
    component.pageRender = undefined;
    component.onChangePages(param);
    expect(component.pageRender).toBe(4);
    expect(param.setPage).not.toHaveBeenCalled();
  });

  it('deve tentar colocar um elemento em tela cheia se não estiver já em tela cheia', () => {
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null); // Inicialmente não em tela cheia
    spyOn(document, 'exitFullscreen').and.callFake(() => Promise.resolve());

    const mockElement = {
      requestFullscreen: jasmine
        .createSpy('requestFullscreen')
        .and.callFake(() => Promise.resolve()),
    };
    component.toggleFullScreenFormulario(mockElement);
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
    component.toggleFullScreenFormulario(mockElement);
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('deve chamar toggleFullScreen com o elemento obtido pelo ID', () => {
    spyOn(component, 'toggleFullScreenFormulario').and.callThrough();
    const elementId = 'testElement';
    const realElement = document.createElement('div');
    Object.defineProperty(realElement, 'requestFullscreen', {
      value: jasmine.createSpy('requestFullscreen'),
      configurable: true,
    });
    spyOn(document, 'getElementById').and.returnValue(realElement);

    component.openFullScreenFormulario(elementId);
    expect(document.getElementById).toHaveBeenCalledWith(elementId);
    expect(component.toggleFullScreenFormulario).toHaveBeenCalledWith(
      jasmine.any(HTMLElement)
    );
    expect(realElement.requestFullscreen).toBeDefined();
  });

  it('should confirm and execute action to alter situation', fakeAsync(() => {
    const acao = 'PUBLICAR';
    const obj = {
      id: 1,
      situacao: 'PUBLICAR',
      jsonForm: "{teste : 'ola'}",
    };
    component.formulario = {
      id: 1,
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
    };

    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    const gestaoFormularioService: GestaoFormularioService =
      fixture.debugElement.injector.get(GestaoFormularioService);
    spyOn(gestaoFormularioService, 'getFormularioById').and.returnValue(
      of(obj)
    );
    spyOn(gestaoFormularioService, 'patchFormulario').and.returnValue(of(obj));
    component.alterarSituacao(acao);
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
      'Deseja publicar o formulário?'
    );
    expect(gestaoFormularioService.patchFormulario).toHaveBeenCalledWith(
      1,
      'PUBLICAR'
    );
  }));

  it('should confirm and execute action to copy form', fakeAsync(() => {
    const formularioId = 3;
    component.formulario = {
      id: formularioId,
      assunto: 'Assunto Teste',
      descricao: 'Descrição Teste',
      versao: '1.0',
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
    };

    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    spyOn(gestaoFormularioService, 'copiarFormulario').and.returnValue(
      of({
        id: 4,
        assunto: 'Assunto Teste',
        descricao: 'Descrição Teste',
        versao: '1.1',
        jsonForm:
          '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
      })
    );

    component.copiarFormulario();
    tick();
    expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
      `
    Deseja criar um cópia com base no Formulário - Descrição Teste - Versão: 1.0?
    `
    );
    expect(gestaoFormularioService.copiarFormulario).toHaveBeenCalledWith(
      formularioId
    );
  }));

  it('should handle error on copy form', fakeAsync(() => {
    const formularioId = 5;
    component.formulario = { id: formularioId };
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(gestaoFormularioService, 'copiarFormulario').and.returnValue(
      throwError(() => new Error('Erro ao copiar formulário'))
    );

    component.copiarFormulario();
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
      jasmine.stringMatching(/Deseja criar um cópia com base no Formulário.*/)
    );
    expect(gestaoFormularioService.copiarFormulario).toHaveBeenCalledWith(
      formularioId
    );
  }));

  it('should confirm and execute action to version form', fakeAsync(() => {
    const formularioId = 6;
    component.formulario = {
      id: formularioId,
      descricao: 'Descrição Teste',
      jsonForm:
        '{"display": "wizard","page": 0,"numPages": 2,"components": [{"title": "INÍCIO","collapsible": false,"key": "par_inicio_par","type": "panel","label": "Panel","input": false,"tableView": false}]}',
    };

    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    spyOn(component.VERSIONAR_FORMULARIO, 'open').and.returnValue(
      Promise.resolve(true)
    );

    component.versionarFormulario(component.formulario);
    tick();

    expect(component.VERSIONAR_FORMULARIO.open).toHaveBeenCalledWith(
      component.formulario
    );
  }));
});
