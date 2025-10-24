import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';

import { AppModule } from 'src/app/app.module';
import { of } from 'rxjs';

import { GestaoEtpTipoLicitacaoComponent } from './gestao-etp-tipo-licitacao.component';
import { EtpTipoLicitacaoModule } from '../etp-tipo-licitacao.module';
import { EtpTipoLicitacaoService } from 'src/app/services/etp-tipo-licitacao-service.service';

describe('GestaoEtpTipoLicitacaoComponent', () => {
  let component: GestaoEtpTipoLicitacaoComponent;
  let fixture: ComponentFixture<GestaoEtpTipoLicitacaoComponent>;
  let gestaoEtpTipoLicitacaoService: EtpTipoLicitacaoService;
  let alertUtils: AlertUtils;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoEtpTipoLicitacaoComponent],
      imports: [EtpTipoLicitacaoModule, AppModule, HttpClientTestingModule],
      providers: [EtpTipoLicitacaoService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoEtpTipoLicitacaoComponent);
    component = fixture.componentInstance;
    alertUtils = TestBed.inject(AlertUtils);
    gestaoEtpTipoLicitacaoService = TestBed.inject(EtpTipoLicitacaoService);
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
    spyOn(component, 'getPesquisaretpTipoLicitacao');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisaretpTipoLicitacao).toHaveBeenCalled();
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
    const service: EtpTipoLicitacaoService = fixture.debugElement.injector.get(
      EtpTipoLicitacaoService
    );
    spyOn(service, 'getEtpTipoLicitacao').and.returnValue(of(response));
    component.tableLazyLoading(true);
    expect(service.getEtpTipoLicitacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisaretpTipoLicitacao', () => {
    const response: any = {};
    const service: EtpTipoLicitacaoService = fixture.debugElement.injector.get(
      EtpTipoLicitacaoService
    );
    spyOn(service, 'getEtpTipoLicitacao').and.returnValue(of(response));
    component.getPesquisaretpTipoLicitacao(true);
    expect(service.getEtpTipoLicitacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtpTipoLicitacao POST', () => {
    const response: any = {};
    const objEtpTipoLicitacao = {
      descricao: 'teste',
    };
    const service: EtpTipoLicitacaoService = fixture.debugElement.injector.get(
      EtpTipoLicitacaoService
    );
    spyOn(service, 'postEtpTipoLicitacao').and.returnValue(of(response));
    component.gravarEtpTipoLicitacao(objEtpTipoLicitacao);
    expect(service.postEtpTipoLicitacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtpTipoLicitacao PUT', () => {
    const response: any = {};
    const objEtpTipoLicitacao = {
      id: 1,

      descricao: 'teste',
    };
    const service: EtpTipoLicitacaoService = fixture.debugElement.injector.get(
      EtpTipoLicitacaoService
    );
    spyOn(service, 'putEtpTipoLicitacao').and.returnValue(of(response));
    component.gravarEtpTipoLicitacao(objEtpTipoLicitacao);
    expect(service.putEtpTipoLicitacao).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {};
    const objEtpTipoLicitacao = {
      id: 1,
    };
    const service: EtpTipoLicitacaoService = fixture.debugElement.injector.get(
      EtpTipoLicitacaoService
    );
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(service, 'deleteEtpTipoLicitacao').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(component, 'tableLazyLoading');
    component.excluirEtpTipoLicitacao(objEtpTipoLicitacao);
    expect(alert.confirmDialog).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar cadastrarEtpTipoLicitacao', () => {
    spyOn(component.CADASTRAR_ETP_TIPO_LICITACAO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarEtpTipoLicitacao();

    expect(component.CADASTRAR_ETP_TIPO_LICITACAO.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarEtpTipoLicitacao', () => {
    spyOn(component.CADASTRAR_ETP_TIPO_LICITACAO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarEtpTipoLicitacao({ id: 1 });

    expect(component.CADASTRAR_ETP_TIPO_LICITACAO.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoEtpTipoLicitacaoFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCampos();

    expect(component.gestaoEtpTipoLicitacaoFiltroForm.reset).toHaveBeenCalled();
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
