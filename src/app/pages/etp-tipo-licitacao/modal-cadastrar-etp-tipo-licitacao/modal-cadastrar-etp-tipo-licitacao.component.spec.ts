import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalCadastrarEtpTipoLicitacaoComponent } from './modal-cadastrar-etp-tipo-licitacao.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertUtils } from 'src/utils/alerts.util';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EtpEtapaService } from 'src/app/services/etp-etapa-service.service';
import { Sarhclientservice } from 'src/app/services/sarhclient.service';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { EtpUnidadeAnaliseService } from 'src/app/services/etp-unidade-analise.service';
import { of, Subject, throwError } from 'rxjs';
import { TemplateRef } from '@angular/core';
import { EtpUnidadeAnaliseComponent } from '../../etp-unidade-analise/etp-unidade-analise.component';
import { EtpPrazoService } from 'src/app/services/etp-prazo.service';
import { PrioridadeService } from 'src/app/services/prioridade.service';
import { EtpPrazoComponent } from '../../etp-prazo/etp-prazo.component';
import { MenuLateralService } from '@administrativo/components';

describe('ModalCadastrarEtpTipoLicitacaoComponent', () => {
  let component: ModalCadastrarEtpTipoLicitacaoComponent;
  let fixture: ComponentFixture<ModalCadastrarEtpTipoLicitacaoComponent>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let modalRefMock: jasmine.SpyObj<NgbModalRef>;
  let alertUtilsMock: jasmine.SpyObj<AlertUtils>;
  let etapaServiceMock: jasmine.SpyObj<EtpEtapaService>;
  let sarhClientMock: jasmine.SpyObj<Sarhclientservice>;
  let bibliotecaMock: jasmine.SpyObj<BibliotecaUtils>;
  let unidadeAnaliseServiceMock: jasmine.SpyObj<EtpUnidadeAnaliseService>;
  let prazoServiceMock: jasmine.SpyObj<EtpPrazoService>;
  let prioridadeServiceMock: jasmine.SpyObj<PrioridadeService>;
  let menuLateralServiceMock: jasmine.SpyObj<MenuLateralService>;

  beforeEach(async () => {
    modalRefMock = jasmine.createSpyObj<NgbModalRef>(
      'NgbModalRef',
      ['close', 'dismiss'],
      { result: Promise.resolve(true) }
    );
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);
    modalServiceMock.open.and.returnValue(modalRefMock);

    alertUtilsMock = jasmine.createSpyObj('AlertUtils', [
      'handleError',
      'handleSucess',
      'toastrErrorMsg',
      'confirmDialog',
    ]);
    // garantir retorno padrão para evitar undefined em testes que não sobrescrevem
    alertUtilsMock.confirmDialog.and.returnValue(Promise.resolve(true));

    etapaServiceMock = jasmine.createSpyObj('EtpEtapaService', [
      'getEtpEtapaLista',
    ]);
    etapaServiceMock.getEtpEtapaLista.and.returnValue(of([]));

    sarhClientMock = jasmine.createSpyObj('Sarhclientservice', [
      'getListaUnidades',
    ]);
    sarhClientMock.getListaUnidades.and.returnValue(of([]));

    bibliotecaMock = jasmine.createSpyObj('BibliotecaUtils', [
      'removeKeysNullable',
    ]);
    bibliotecaMock.removeKeysNullable.and.callFake((o) => o);

    unidadeAnaliseServiceMock = jasmine.createSpyObj(
      'EtpUnidadeAnaliseService',
      [
        'getUnidadeAnalise',
        'deleteUnidadeAnalise',
        'putUnidadeAnalise',
        'postUnidadeAnalise',
      ]
    );
    unidadeAnaliseServiceMock.getUnidadeAnalise.and.returnValue(
      of({ content: [], totalElements: 0 })
    );
    unidadeAnaliseServiceMock.deleteUnidadeAnalise.and.returnValue(of({}));
    unidadeAnaliseServiceMock.putUnidadeAnalise.and.returnValue(of({}));
    unidadeAnaliseServiceMock.postUnidadeAnalise.and.returnValue(of({}));

    prazoServiceMock = jasmine.createSpyObj(
      'EtpPrazoService',
      [
        'getPrazo',
        'deletePrazo',
        'putPrazo',
        'postPrazo',
      ]
    );
    prazoServiceMock.getPrazo.and.returnValue(
      of({ content: [], totalElements: 0 })
    );
    prazoServiceMock.deletePrazo.and.returnValue(of({}));
    prazoServiceMock.putPrazo.and.returnValue(of({}));
    prazoServiceMock.postPrazo.and.returnValue(of({}));

    prioridadeServiceMock = jasmine.createSpyObj('PrioridadeService', [
      'getPrioridadeFormulario',
    ]);
    prioridadeServiceMock.getPrioridadeFormulario.and.returnValue(of([]));

    menuLateralServiceMock = jasmine.createSpyObj('MenuLateralService', [
      'disable',
    ]);
    (menuLateralServiceMock as any).onSelect = new Subject<number>();
    menuLateralServiceMock.disable();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        ModalCadastrarEtpTipoLicitacaoComponent,
        EtpUnidadeAnaliseComponent,
        EtpPrazoComponent
      ],
      providers: [
        FormBuilder,
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: AlertUtils, useValue: alertUtilsMock },
        { provide: EtpEtapaService, useValue: etapaServiceMock },
        { provide: PrioridadeService, useValue: prioridadeServiceMock },
        { provide: MenuLateralService, useValue: menuLateralServiceMock },
        { provide: Sarhclientservice, useValue: sarhClientMock },
        { provide: BibliotecaUtils, useValue: bibliotecaMock },
        {
          provide: EtpUnidadeAnaliseService,
          useValue: unidadeAnaliseServiceMock,
        },
        {
          provide: EtpPrazoService,
          useValue: prazoServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarEtpTipoLicitacaoComponent);
    component = fixture.componentInstance;
    component['modalContent'] = {} as TemplateRef<any>;
    component.ETP_UNIDADE_ANALISE = jasmine.createSpyObj(
      'EtpUnidadeAnaliseComponent',
      ['open']
    );
    component.ETP_PRAZO = jasmine.createSpyObj(
      'EtpPrazoComponent',
      ['open']
    );
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('open deve configurar form e abrir modal', async () => {
    etapaServiceMock.getEtpEtapaLista.and.returnValue(of([]));
    sarhClientMock.getListaUnidades.and.returnValue(of([]));

    const promise = component.open({ id: 1, descricao: 'desc', chave: 'ch' });
    expect(component.titulo).toBe('Alterar Tipo de Contratação');
    await expectAsync(promise).toBeResolved();
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('open sem id deve setar titulo de cadastro', async () => {
    etapaServiceMock.getEtpEtapaLista.and.returnValue(of([]));
    sarhClientMock.getListaUnidades.and.returnValue(of([]));
    const promise = component.open({});
    expect(component.titulo).toBe('Cadastrar Tipo de Contratação');
    await expectAsync(promise).toBeResolved();
  });

  it('getEtapas deve preencher lista', () => {
    etapaServiceMock.getEtpEtapaLista.and.returnValue(of([{ id: 1 }]));
    component.getEtapas();
    expect(component.etapaList.length).toBe(1);
  });

  it('getUnidades deve preencher lista', () => {
    sarhClientMock.getListaUnidades.and.returnValue(of([{ id: 1 }]));
    component.getUnidades();
    expect(component.unidadesList.length).toBe(1);
  });

  it('gravar deve emitir evento', () => {
    component.gestaoEtpTipoLicitacaoModalForm = new FormBuilder().group({
      descricao: ['desc'],
      chave: ['ch'],
    });
    component.etpTipoLicitacao = { id: 5 };
    spyOn(component.cadastrarEtpTipoLicitacao, 'emit');
    component.gravar();
    expect(component.cadastrarEtpTipoLicitacao.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 5 })
    );
  });

  it('close deve fechar modal', () => {
    component.modalRef = modalRefMock;
    component.close();
    expect(modalRefMock.dismiss).toHaveBeenCalled();
  });

  it('adicionarEtpUnidadeAnalise deve chamar open se id existir', () => {
    component.etpTipoLicitacao = { id: 1 };
    component.adicionarEtpUnidadeAnalise();
    expect(component.ETP_UNIDADE_ANALISE.open).toHaveBeenCalled();
  });

  it('adicionarEtpUnidadeAnalise deve exibir erro se id não existir', () => {
    component.etpTipoLicitacao = {};
    component.adicionarEtpUnidadeAnalise();
    expect(alertUtilsMock.handleError).toHaveBeenCalled();
  });

  it('editarEtpUnidadeAnalise deve chamar open', () => {
    component.editarEtpUnidadeAnalise({});
    expect(component.ETP_UNIDADE_ANALISE.open).toHaveBeenCalled();
  });

  it('excluirEtpUnidadeAnalise sucesso', async () => {
    alertUtilsMock.confirmDialog.and.returnValue(Promise.resolve(true));
    unidadeAnaliseServiceMock.deleteUnidadeAnalise.and.returnValue(of({}));

    await component.excluirEtpUnidadeAnalise({ id: 1 });

    expect(unidadeAnaliseServiceMock.deleteUnidadeAnalise).toHaveBeenCalledWith(
      1
    );
    expect(alertUtilsMock.handleSucess).toHaveBeenCalled();
  });

  it('excluirEtpUnidadeAnalise erro', async () => {
    alertUtilsMock.confirmDialog.and.returnValue(Promise.resolve(true));
    unidadeAnaliseServiceMock.deleteUnidadeAnalise.and.returnValue(
      throwError(() => 'erro')
    );

    await component.excluirEtpUnidadeAnalise({ id: 1 });

    expect(unidadeAnaliseServiceMock.deleteUnidadeAnalise).toHaveBeenCalledWith(
      1
    );
    expect(alertUtilsMock.toastrErrorMsg).toHaveBeenCalled();
  });

  it('tableLazyLoading deve chamar getPesquisarUnidadesAnalise', () => {
    spyOn(component, 'getPesquisarUnidadesAnalise');
    component.tableLazyLoading();
    expect(component.getPesquisarUnidadesAnalise).toHaveBeenCalled();
  });

  it('getPesquisarUnidadesAnalise sucesso lazyLoading true', () => {
    bibliotecaMock.removeKeysNullable.and.callFake((obj) => obj);
    unidadeAnaliseServiceMock.getUnidadeAnalise.and.returnValue(
      of({ content: [1], totalElements: 1 })
    );
    component.page = { content: [], totalElements: 0 } as any;
    component.etpTipoLicitacao = { id: 5 };

    component.getPesquisarUnidadesAnalise({}, true);
    expect(component.page.totalElements).toBe(1);
  });

  it('getPesquisarUnidadesAnalise sucesso lazyLoading false', () => {
    bibliotecaMock.removeKeysNullable.and.callFake((obj) => obj);
    unidadeAnaliseServiceMock.getUnidadeAnalise.and.returnValue(
      of({ content: [1], totalElements: 1 })
    );
    component.etpTipoLicitacao = { id: 5 };
    component.getPesquisarUnidadesAnalise({}, false);
    expect(component.page.content).toEqual([1]);
  });

  it('getPesquisarUnidadesAnalise erro', () => {
    bibliotecaMock.removeKeysNullable.and.callFake((obj) => obj);
    unidadeAnaliseServiceMock.getUnidadeAnalise.and.returnValue(
      throwError(() => 'erro')
    );
    component.getPesquisarUnidadesAnalise({}, false);
    expect(alertUtilsMock.handleError).toHaveBeenCalled();
  });

  it('initPage deve inicializar page', () => {
    component.initPage();
    expect(component.page.content).toEqual([]);
  });

  it('incluirUnidadeAnalise PUT', () => {
    unidadeAnaliseServiceMock.putUnidadeAnalise.and.returnValue(of({}));
    component.etpTipoLicitacao = { id: 10 };
    component.incluirUnidadeAnalise({
      unidadeAnaliseId: 1,
      unidade: { id: 2, descricao: 'abc' },
      etapa: 'et',
      padrao: 'p',
    });
    expect(unidadeAnaliseServiceMock.putUnidadeAnalise).toHaveBeenCalled();
  });

  it('incluirUnidadeAnalise POST', () => {
    unidadeAnaliseServiceMock.postUnidadeAnalise.and.returnValue(of({}));
    component.etpTipoLicitacao = { id: 10 };
    component.incluirUnidadeAnalise({
      unidade: { id: 2, descricao: 'abc' },
      etapa: 'et',
      padrao: 'p',
    });
    expect(unidadeAnaliseServiceMock.postUnidadeAnalise).toHaveBeenCalled();
  });

  ///daqui pra baixo

  it('adicionarEtpPrazo deve chamar open se id existir', () => {
    component.etpTipoLicitacao = { id: 1 };
    component.adicionarEtpPrazo();
    expect(component.ETP_PRAZO.open).toHaveBeenCalled();
  });

  it('adicionarEtpPrazo deve exibir erro se id não existir', () => {
    component.etpTipoLicitacao = {};
    component.adicionarEtpPrazo();
    expect(alertUtilsMock.handleError).toHaveBeenCalled();
  });

  it('editarEtpPrazo deve chamar open', () => {
    component.editarEtpPrazo({});
    expect(component.ETP_PRAZO.open).toHaveBeenCalled();
  });

  it('excluirEtpPrazo sucesso', async () => {
    alertUtilsMock.confirmDialog.and.returnValue(Promise.resolve(true));
    prazoServiceMock.deletePrazo.and.returnValue(of({}));

    await component.excluirEtpPrazo({ id: 1 });

    expect(prazoServiceMock.deletePrazo).toHaveBeenCalledWith(
      1
    );
    expect(alertUtilsMock.handleSucess).toHaveBeenCalled();
  });

  it('excluirEtpPrazo erro', async () => {
    alertUtilsMock.confirmDialog.and.returnValue(Promise.resolve(true));
    prazoServiceMock.deletePrazo.and.returnValue(
      throwError(() => 'erro')
    );

    await component.excluirEtpPrazo({ id: 1 });

    expect(prazoServiceMock.deletePrazo).toHaveBeenCalledWith(
      1
    );
    expect(alertUtilsMock.toastrErrorMsg).toHaveBeenCalled();
  });

  it('tableLazyLoadingPrazo deve chamar getPesquisarPrazo', () => {
    spyOn(component, 'getPesquisarPrazo');
    component.tableLazyLoadingPrazo();
    expect(component.getPesquisarPrazo).toHaveBeenCalled();
  });

  it('getPesquisarPrazo sucesso lazyLoadingPrazo true', () => {
    bibliotecaMock.removeKeysNullable.and.callFake((obj) => obj);
    prazoServiceMock.getPrazo.and.returnValue(
      of({ content: [1], totalElements: 1 })
    );
    component.pagePrazo = { content: [], totalElements: 0 } as any;
    component.etpTipoLicitacao = { id: 5 };

    component.getPesquisarPrazo({}, true);
    expect(component.pagePrazo.totalElements).toBe(1);
  });

  it('getPesquisarPrazo sucesso lazyLoadingPrazo false', () => {
    bibliotecaMock.removeKeysNullable.and.callFake((obj) => obj);
    prazoServiceMock.getPrazo.and.returnValue(
      of({ content: [1], totalElements: 1 })
    );
    component.etpTipoLicitacao = { id: 5 };
    component.getPesquisarPrazo({}, false);
    expect(component.pagePrazo.content).toEqual([1]);
  });

  it('getPesquisarPrazo erro', () => {
    bibliotecaMock.removeKeysNullable.and.callFake((obj) => obj);
    prazoServiceMock.getPrazo.and.returnValue(
      throwError(() => 'erro')
    );
    component.getPesquisarPrazo({}, false);
    expect(alertUtilsMock.handleError).toHaveBeenCalled();
  });

  it('initPagePrazo deve inicializar pagePrazo', () => {
    component.initPagePrazo();
    expect(component.pagePrazo.content).toEqual([]);
  });

  it('incluirPrazo PUT', () => {
    prazoServiceMock.putPrazo.and.returnValue(of({}));
    component.etpTipoLicitacao = { id: 10 };
    component.incluirPrazo({
      prazoId: 1,
      unidade: { id: 2, descricao: 'abc' },
      etapa: 'et',
      padrao: 'p',
    });
    expect(prazoServiceMock.putPrazo).toHaveBeenCalled();
  });

  it('incluirPrazo POST', () => {
    prazoServiceMock.postPrazo.and.returnValue(of({}));
    component.etpTipoLicitacao = { id: 10 };
    component.incluirPrazo({
      unidade: { id: 2, descricao: 'abc' },
      etapa: 'et',
      padrao: 'p',
    });
    expect(prazoServiceMock.postPrazo).toHaveBeenCalled();
  });
});
