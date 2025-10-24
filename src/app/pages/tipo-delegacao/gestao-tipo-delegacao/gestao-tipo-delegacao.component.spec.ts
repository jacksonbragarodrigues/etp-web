import { ComponentFixture, TestBed } from '@angular/core/testing';


import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';

import { of } from 'rxjs';
import { AppModule } from 'src/app/app.module';
import { TipoDelegacaoService } from 'src/app/services/tipo-delegacao.service';
import { TipoDelegacaoModule } from '../tipo-delegacao.module';
import { GestaoTipoDelegacaoComponent } from './gestao-tipo-delegacao.component';

describe('GestaoTipoDelegacaoComponent', () => {
  let component: GestaoTipoDelegacaoComponent;
  let fixture: ComponentFixture<GestaoTipoDelegacaoComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoTipoDelegacaoComponent],
      imports: [TipoDelegacaoModule, AppModule, HttpClientTestingModule],
      providers: [TipoDelegacaoService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoTipoDelegacaoComponent);
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
    spyOn(component, 'getPesquisarTipoDelegacao');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarTipoDelegacao).toHaveBeenCalled();
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
    const service: TipoDelegacaoService =
      fixture.debugElement.injector.get(TipoDelegacaoService);
    spyOn(service, 'getTipoDelegacao').and.returnValue(of(response));
    component.tableLazyLoading(true);
    expect(service.getTipoDelegacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisarTipoDelegacao', () => {
    const response: any = {};
    const service: TipoDelegacaoService =
    fixture.debugElement.injector.get(TipoDelegacaoService);
    spyOn(service, 'getTipoDelegacao').and.returnValue(of(response));
    component.getPesquisarTipoDelegacao(true);
    expect(service.getTipoDelegacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarTipoDelegacao POST', () => {
    const response: any = {};
    const objTipoDelegacao = {
      descricao: 'teste',
      chave: 'etp',
    };
    const service: TipoDelegacaoService =
    fixture.debugElement.injector.get(TipoDelegacaoService);
    spyOn(service, 'postTipoDelegacao').and.returnValue(of(response));
    component.gravarTipoDelegacao(objTipoDelegacao);
    expect(service.postTipoDelegacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarTipoDelegacao PUT', () => {
    const response: any = {};
    const objTipoDelegacao = {
      id: 1,
      descricao: 'teste',
      chave: 'etp',
    };
    const service: TipoDelegacaoService =
    fixture.debugElement.injector.get(TipoDelegacaoService);
    spyOn(service, 'putTipoDelegacao').and.returnValue(of(response));
    component.gravarTipoDelegacao(objTipoDelegacao);
    expect(service.putTipoDelegacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {};
    const objTipoDelegacao = {
      id: 1,
    };
    const service: TipoDelegacaoService =
    fixture.debugElement.injector.get(TipoDelegacaoService);
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(service, 'deleteTipoDelegacao').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(component, 'tableLazyLoading');
    component.excluirTipoDelegacao(objTipoDelegacao);
    expect(alert.confirmDialog).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar cadastrarTipoDelegacao', () => {
    spyOn(component.CADASTRAR_TIPO_DELEGACAO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarTipoDelegacao();

    expect(component.CADASTRAR_TIPO_DELEGACAO.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarTipoDelegacao', () => {
    spyOn(component.CADASTRAR_TIPO_DELEGACAO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarTipoDelegacao({ id: 1 });

    expect(component.CADASTRAR_TIPO_DELEGACAO.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoTipoDelegacaoFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCampos();

    expect(component.gestaoTipoDelegacaoFiltroForm.reset).toHaveBeenCalled();
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
