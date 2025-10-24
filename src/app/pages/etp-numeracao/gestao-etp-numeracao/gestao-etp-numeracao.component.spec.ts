import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaoEtpNumeracaoComponent } from './gestao-etp-numeracao.component';
import {FormBuilder} from "@angular/forms";
import {BibliotecaUtils} from "../../../../utils/biblioteca.utils";
import {AlertUtils} from "../../../../utils/alerts.util";
import {EtpNumeracaoService} from "../../../services/etp-numeracao.service";
import {GestaoEtpService} from "../../../services/gestao-etp.service";
import {EtpNumeracaoModule} from "../etp-numeracao.module";
import {AppModule} from "../../../app.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {of} from "rxjs";
import { NotificacaoService } from '@administrativo/components';

describe('GestaoEtpNumeracaoComponent', () => {
  let component: GestaoEtpNumeracaoComponent;
  let fixture: ComponentFixture<GestaoEtpNumeracaoComponent>;
  let alertUtils: any;
  let gestaoEtpNumeracaoService: any;
  let gestaoEtpService: any;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoEtpNumeracaoComponent],
      imports: [EtpNumeracaoModule, AppModule, HttpClientTestingModule],
      providers: [
        EtpNumeracaoService,
        GestaoEtpService,
        { provide: NotificacaoService, useValue: jasmine.createSpyObj('NotificacaoService', ['notify']) },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestaoEtpNumeracaoComponent);
    component = fixture.componentInstance;
    gestaoEtpNumeracaoService = TestBed.inject(EtpNumeracaoService);
    gestaoEtpService = TestBed.inject(GestaoEtpService);
    alertUtils = TestBed.inject(AlertUtils);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaPage e tableLazyLoading no ngOnInit', () => {
    spyOn(component, 'iniciaPage');
    spyOn(component, 'tableLazyLoading');
    spyOn(component, 'setAnoAtual');
    spyOn(component, 'monstarStatus');
    spyOn(component, 'montarNomeEtp');

    component.ngOnInit();

    expect(component.iniciaPage).toHaveBeenCalled();
    expect(component.tableLazyLoading).toHaveBeenCalled();
    expect(component.setAnoAtual).toHaveBeenCalled();
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
    spyOn(component, 'getPesquisarEtpNumeracao');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarEtpNumeracao).toHaveBeenCalled();
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
    const service: EtpNumeracaoService =
      fixture.debugElement.injector.get(EtpNumeracaoService);
    spyOn(service, 'getEtpNumeracao').and.returnValue(of(response));
    component.tableLazyLoading();
    expect(service.getEtpNumeracao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtpNumeracao POST', () => {
    const response: any = {};
    const objEtpNumeracao = {
      ano: 2024,
      etpNumeracao: 1,
      status: 1,
      idEtp: 1
    };
    const service: EtpNumeracaoService =
      fixture.debugElement.injector.get(EtpNumeracaoService);
    spyOn(service, 'postEtpNumeracao').and.returnValue(of(response));
    component.gravarEtpNumeracao(objEtpNumeracao);
    expect(service.postEtpNumeracao).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtpNumeracao PUT', () => {
    const response: any = {};
    const objEtpNumeracao = {
      idNumeracaoEtp: 1,
      ano: 2024,
      etpNumeracao: 1,
      status: 1,
      idEtp: 1
    };
    const service: EtpNumeracaoService =
      fixture.debugElement.injector.get(EtpNumeracaoService);
    spyOn(service, 'putEtpNumeracao').and.returnValue(of(response));
    component.gravarEtpNumeracao(objEtpNumeracao);
    expect(service.putEtpNumeracao).toHaveBeenCalled();
  });


  it('deve chamar a funcao excluirEtpNumerção', () => {
    const response: any = {
      teste: '1',
    };
    const objEtpNumeracao = {
      idNumeracaoEtp: 1,
    };
    const service: EtpNumeracaoService =
      fixture.debugElement.injector.get(EtpNumeracaoService);
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);

    spyOn(service, 'deleteEtpNumeracao').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(component, 'tableLazyLoading');

    component.excluirEtpNumeracao(objEtpNumeracao);

    expect(alert.confirmDialog).toHaveBeenCalledWith(
      `Deseja excluir a numeração?`
    );
  });

  it('deve chamar open ao chamar cadastrarEtpNumeraçõa', () => {
    spyOn(component.CADASTRAR_NUMERACAO, 'open');
    component.cadastrarEtpNumeracao();
    expect(component.CADASTRAR_NUMERACAO.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarEtpNumeração', () => {
    let item = {
      idNumeracaoEtp: 1,
      ano: 2024,
      etp: {
        id: 1
      },
      etpNumeracao: 1,
      status: 1,
    }
    spyOn(component.CADASTRAR_NUMERACAO, 'open');
    component.editarEtpNumeracao(item);
    expect(component.CADASTRAR_NUMERACAO.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoEtpNumercaoFiltroForm, 'reset');
    component.limparCampos();

    expect(component.gestaoEtpNumercaoFiltroForm.reset).toHaveBeenCalled();
  });

  it('deve retornar true para uma ação permitida', () => {

    const result = component.acaoPermitida({}, 'EDITAR');
    expect(result).toBe(true);
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

  it('deve chamar montar nome ETP', () => {
    const response: any = {};
    const item = {
      etp: {
        id: 1,
        descricao: 'teste'
      }
    };
    let result = component.montarNomeEtp(item);
    expect(result).toBe('1 - teste');
  });

  it('deve chamar montar nome status ATIVO', () => {
    const item = {
      status: 1
    };
    let result = component.monstarStatus(item);
    expect(result).toBe('ATIVO');
  });

  it('deve chamar montar nome status ATIVO', () => {
    const item = {
      status: 0
    };
    let result = component.monstarStatus(item);
    expect(result).toBe('INATIVO');
  });


});
