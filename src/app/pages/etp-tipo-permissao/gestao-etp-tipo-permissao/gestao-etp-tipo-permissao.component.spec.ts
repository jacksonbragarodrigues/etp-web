import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';

import { AppModule } from 'src/app/app.module';
import { of } from 'rxjs';
import { GestaoEtpTipoPermissaoComponent } from './gestao-etp-tipo-permissao.component';
import { EtpTipoPermissaoModule } from '../etp-tipo-permissao.module';
import { EtpTipoPermissaoService } from 'src/app/services/etp-tipo-permissao.service';

describe('GestaoEtpTipoPermissaoComponent', () => {
  let component: GestaoEtpTipoPermissaoComponent;
  let fixture: ComponentFixture<GestaoEtpTipoPermissaoComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoEtpTipoPermissaoComponent],
      imports: [EtpTipoPermissaoModule, AppModule, HttpClientTestingModule],
      providers: [EtpTipoPermissaoService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoEtpTipoPermissaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaPage e tableLazyLoading no ngOnInit', () => {
    spyOn(component, 'iniciaPage');
    spyOn(component, 'tableLazyLoadingTipoPermissao');

    component.ngOnInit();

    expect(component.iniciaPage).toHaveBeenCalled();
    expect(component.tableLazyLoadingTipoPermissao).toHaveBeenCalled();
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
    spyOn(component, 'getPesquisarEtpTipoPermissao');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarEtpTipoPermissao).toHaveBeenCalled();
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
    const service: EtpTipoPermissaoService = fixture.debugElement.injector.get(
      EtpTipoPermissaoService
    );
    spyOn(service, 'getEtpTipoPermissao').and.returnValue(of(response));
    component.tableLazyLoadingTipoPermissao(true);
    expect(service.getEtpTipoPermissao).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisarEtpTipoPermissao', () => {
    const response: any = {};
    const service: EtpTipoPermissaoService = fixture.debugElement.injector.get(
      EtpTipoPermissaoService
    );
    spyOn(service, 'getEtpTipoPermissao').and.returnValue(of(response));
    component.getPesquisarEtpTipoPermissao(true);
    expect(service.getEtpTipoPermissao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtpTipoPermissao POST', () => {
    const response: any = {};
    const objEtpTipoPermissao = {
      descricao: 'teste',
    };
    const service: EtpTipoPermissaoService = fixture.debugElement.injector.get(
      EtpTipoPermissaoService
    );
    spyOn(service, 'postEtpTipoPermissao').and.returnValue(of(response));
    component.gravarEtpTipoPermissao(objEtpTipoPermissao);
    expect(service.postEtpTipoPermissao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtpTipoPermissao PUT', () => {
    const response: any = {};
    const objEtpTipoPermissao = {
      id: 1,

      descricao: 'teste',
    };
    const service: EtpTipoPermissaoService = fixture.debugElement.injector.get(
      EtpTipoPermissaoService
    );
    spyOn(service, 'putEtpTipoPermissao').and.returnValue(of(response));
    component.gravarEtpTipoPermissao(objEtpTipoPermissao);
    expect(service.putEtpTipoPermissao).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {};
    const objEtpTipoPermissao = {
      id: 1,
    };
    const service: EtpTipoPermissaoService = fixture.debugElement.injector.get(
      EtpTipoPermissaoService
    );
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(service, 'deleteEtpTipoPermissao').and.returnValue(of(response));
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(alert, 'handleSucess');
    spyOn(component, 'tableLazyLoadingTipoPermissao');
    component.excluirEtpTipoPermissao(objEtpTipoPermissao);
    expect(alert.confirmDialog).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar cadastrarEtpTipoPermissao', () => {
    spyOn(component.CADASTRAR_ETP_TIPO_PERMISSAO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarEtpTipoPermissao();

    expect(component.CADASTRAR_ETP_TIPO_PERMISSAO.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarEtpTipoPermissao', () => {
    spyOn(component.CADASTRAR_ETP_TIPO_PERMISSAO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarEtpTipoPermissao({ id: 1 });

    expect(component.CADASTRAR_ETP_TIPO_PERMISSAO.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoEtpTipoPermissaoFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCamposTipoPermissao();

    expect(component.gestaoEtpTipoPermissaoFiltroForm.reset).toHaveBeenCalled();
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
