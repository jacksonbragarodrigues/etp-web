import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaoSituacaoComponent } from './gestao-situacao.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';

import { AppModule } from 'src/app/app.module';
import { of } from 'rxjs';
import { SituacaoFormularioServiceService } from 'src/app/services/situacao-formulario-service.service';
import { SituacaoModule } from '../situacao.module';

describe('GestaoSituacaoComponent', () => {
  let component: GestaoSituacaoComponent;
  let fixture: ComponentFixture<GestaoSituacaoComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoSituacaoComponent],
      imports: [SituacaoModule, AppModule, HttpClientTestingModule],
      providers: [SituacaoFormularioServiceService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoSituacaoComponent);
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
    spyOn(component, 'getPesquisarSituacao');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarSituacao).toHaveBeenCalled();
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
    const service: SituacaoFormularioServiceService =
      fixture.debugElement.injector.get(SituacaoFormularioServiceService);
    spyOn(service, 'getSituacao').and.returnValue(of(response));
    component.tableLazyLoading(true);
    expect(service.getSituacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisarSituacao', () => {
    const response: any = {};
    const service: SituacaoFormularioServiceService =
      fixture.debugElement.injector.get(SituacaoFormularioServiceService);
    spyOn(service, 'getSituacao').and.returnValue(of(response));
    component.getPesquisarSituacao(true);
    expect(service.getSituacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarSituacao POST', () => {
    const response: any = {};
    const objSituacao = {
      descricao: 'teste',
    };
    const service: SituacaoFormularioServiceService =
      fixture.debugElement.injector.get(SituacaoFormularioServiceService);
    spyOn(service, 'postSituacao').and.returnValue(of(response));
    component.gravarSituacao(objSituacao);
    expect(service.postSituacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarSituacao PUT', () => {
    const response: any = {};
    const objSituacao = {
      id: 1,

      descricao: 'teste',
    };
    const service: SituacaoFormularioServiceService =
      fixture.debugElement.injector.get(SituacaoFormularioServiceService);
    spyOn(service, 'putSituacao').and.returnValue(of(response));
    component.gravarSituacao(objSituacao);
    expect(service.putSituacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {};
    const objSituacao = {
      id: 1,
    };
    const service: SituacaoFormularioServiceService =
      fixture.debugElement.injector.get(SituacaoFormularioServiceService);
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(service, 'deleteSituacao').and.returnValue(of(response));
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(alert, 'handleSucess');
    spyOn(component, 'tableLazyLoading');
    component.excluirSituacao(objSituacao);
    expect(alert.confirmDialog).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar cadastrarSituacao', () => {
    spyOn(component.CADASTRAR_SITUACAO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarSituacao();

    expect(component.CADASTRAR_SITUACAO.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarSituacao', () => {
    spyOn(component.CADASTRAR_SITUACAO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarSituacao({ id: 1 });

    expect(component.CADASTRAR_SITUACAO.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoSituacaoFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCampos();

    expect(component.gestaoSituacaoFiltroForm.reset).toHaveBeenCalled();
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
