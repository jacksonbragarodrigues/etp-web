import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaoAssuntoComponent } from './gestao-assunto.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';

import { AppModule } from 'src/app/app.module';
import { of } from 'rxjs';
import { AssuntoFormularioServiceService } from 'src/app/services/assunto-formulario-service.service';
import { AssuntoModule } from '../assunto.module';

describe('GestaoAssuntoComponent', () => {
  let component: GestaoAssuntoComponent;
  let fixture: ComponentFixture<GestaoAssuntoComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoAssuntoComponent],
      imports: [AssuntoModule, AppModule, HttpClientTestingModule],
      providers: [AssuntoFormularioServiceService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoAssuntoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaPage e tableLazyLoading no ngOnInit', () => {
    spyOn(component, 'iniciaPage');
    spyOn(component, 'tableLazyLoading');

    component.ngOnInit();

    expect(component.iniciaPage).toHaveBeenCalled();
    expect(component.tableLazyLoading).toHaveBeenCalled();
  });

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
    spyOn(component, 'getPesquisarAssunto');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarAssunto).toHaveBeenCalled();
    component.headers.forEach((header: any) => {
      if (header.sortable !== coluna) {
        expect(header.direcao).toBe('');
      } else {
        expect(header.direcao).toBe(direcao);
      }
    });
  });

  it('deve chamar a funcao tableLazyLoading', () => {
    const response: any = {};
    const service: AssuntoFormularioServiceService =
      fixture.debugElement.injector.get(AssuntoFormularioServiceService);
    spyOn(service, 'getAssunto').and.returnValue(of(response));
    component.tableLazyLoading(true);
    expect(service.getAssunto).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisarAssunto', () => {
    const response: any = {};
    const service: AssuntoFormularioServiceService =
      fixture.debugElement.injector.get(AssuntoFormularioServiceService);
    spyOn(service, 'getAssunto').and.returnValue(of(response));
    component.getPesquisarAssunto(true);
    expect(service.getAssunto).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarAssunto POST', () => {
    const response: any = {};
    const objAssunto = {
      descricao: 'teste',
      chave: 'etp',
    };
    const service: AssuntoFormularioServiceService =
      fixture.debugElement.injector.get(AssuntoFormularioServiceService);
    spyOn(service, 'postAssunto').and.returnValue(of(response));
    component.gravarAssunto(objAssunto);
    expect(service.postAssunto).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarAssunto PUT', () => {
    const response: any = {};
    const objAssunto = {
      id: 1,
      descricao: 'teste',
      chave: 'etp',
    };
    const service: AssuntoFormularioServiceService =
      fixture.debugElement.injector.get(AssuntoFormularioServiceService);
    spyOn(service, 'putAssunto').and.returnValue(of(response));
    component.gravarAssunto(objAssunto);
    expect(service.putAssunto).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {};
    const objAssunto = {
      id: 1,
    };
    const service: AssuntoFormularioServiceService =
      fixture.debugElement.injector.get(AssuntoFormularioServiceService);
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(service, 'deleteAssunto').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(component, 'tableLazyLoading');
    component.excluirAssunto(objAssunto);
    expect(alert.confirmDialog).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar cadastrarAssunto', () => {
    spyOn(component.CADASTRAR_ASSUNTO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarAssunto();

    expect(component.CADASTRAR_ASSUNTO.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarAssunto', () => {
    spyOn(component.CADASTRAR_ASSUNTO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarAssunto({ id: 1 });

    expect(component.CADASTRAR_ASSUNTO.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoAssuntoFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCampos();

    expect(component.gestaoAssuntoFiltroForm.reset).toHaveBeenCalled();
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

    expect(component.gestaoBase.getDataModificacao(itemAlteracao)).toEqual(
      itemAlteracao.dataAlteracao
    );
    expect(component.gestaoBase.getUsuarioModificacao(itemAlteracao)).toEqual(
      itemAlteracao.usuarioAlteracao
    );
    expect(component.gestaoBase.getDataModificacao(itemRegistro)).toEqual(
      itemRegistro.dataRegistro
    );
    expect(component.gestaoBase.getUsuarioModificacao(itemRegistro)).toEqual(
      itemRegistro.usuarioRegistro
    );
  });
});
