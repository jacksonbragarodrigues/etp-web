import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVisualizarFormularioPadraoComponent } from './modal-visualizar-formulario-padrao.component';
import { FormBuilder } from '@angular/forms';
import { PrincipalModule } from '../../principal/principal.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppModule } from 'src/app/app.module';
import { AlertUtils } from 'src/utils/alerts.util';

describe('ModalVisualizarFormularioPadraoComponent', () => {
  let component: ModalVisualizarFormularioPadraoComponent;
  let fixture: ComponentFixture<ModalVisualizarFormularioPadraoComponent>;
  let alertUtils: AlertUtils;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalVisualizarFormularioPadraoComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalVisualizarFormularioPadraoComponent);
    alertUtils = TestBed.inject(AlertUtils);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      expect(component.parametrosView.IS_SALVAR).toBeFalse();
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);
  });


  it('deve fechar a modal com sucesso', () => {
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);

    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    component.close();
    expect(alertUtils.confirmDialog).toHaveBeenCalledWith('Deseja sair?');
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
    expect(alertUtils.confirmDialog).toHaveBeenCalledWith('Deseja sair?');
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

    component.onChangeRendererView(param);
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
    component.onChangeRendererView(param);
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
    component.onChangeRendererView(param);
    expect(component.pageRender).toEqual(undefined);
  });


  it('deve mudar o texto do botão para "Fechar" se o texto original for "Salvar"', () => {
    let button = document.createElement('button');
    button.textContent = 'Salvar';
    component.updateButtonView(button);
    expect(button.textContent).toBe('Fechar');
  });

  it('deve definir pageRender como undefined se param é válido', () => {
    const param = {
      isValid: () => true,
      setPage: jasmine.createSpy('setPage'),
      page: 1,
    };
    component.pageRender = 5;
    component.onChangePagesView(param);
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
    component.onChangePagesView(param);
    expect(param.setPage).toHaveBeenCalledWith(3);
  });

  it('deve definir pageRender para o valor de param.page se param não é válido e pageRender é undefined', () => {
    const param = {
      isValid: () => false,
      setPage: jasmine.createSpy('setPage'),
      page: 4,
    };
    component.pageRender = undefined;
    component.onChangePagesView(param);
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
    component.toggleFullScreenFormularioView(mockElement);
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
    component.toggleFullScreenFormularioView(mockElement);
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('deve chamar toggleFullScreen com o elemento obtido pelo ID', () => {
    spyOn(component, 'toggleFullScreenFormularioView').and.callThrough();
    const elementId = 'testElement';
    const realElement = document.createElement('div');
    Object.defineProperty(realElement, 'requestFullscreen', {
      value: jasmine.createSpy('requestFullscreen'),
      configurable: true,
    });
    spyOn(document, 'getElementById').and.returnValue(realElement);

    component.openFullScreenFormularioView(elementId);
    expect(document.getElementById).toHaveBeenCalledWith(elementId);
    expect(component.toggleFullScreenFormularioView).toHaveBeenCalledWith(
      jasmine.any(HTMLElement)
    );
    expect(realElement.requestFullscreen).toBeDefined();
  });
});

