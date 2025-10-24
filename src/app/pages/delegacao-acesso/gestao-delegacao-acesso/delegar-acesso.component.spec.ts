import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { AlertUtils } from '../../../../utils/alerts.util';
import { AppModule } from '../../../app.module';
import { DelegacaoAcessoService } from '../../../services/delegacao-acesso.service';
import { EtpTipoPermissaoService } from '../../../services/etp-tipo-permissao.service';
import { Sarhclientservice } from '../../../services/sarhclient.service';
import { TipoDelegacaoService } from '../../../services/tipo-delegacao.service';
import { DelegarAcessoComponent } from './delegar-acesso.component';
import { DelegarAcessoModule } from './delegar-acesso.module';

describe('DelegarAcessoComponent', () => {
  let component: DelegarAcessoComponent;
  let fixture: ComponentFixture<DelegarAcessoComponent>;
  //let modalService: NgbModal;
  let alertUtils: AlertUtils;
  let sarhclientservice: Sarhclientservice;
  let tipoPermisaoService: EtpTipoPermissaoService;
  let tipoDelegacaoService: TipoDelegacaoService;
  let delegacaoAcessoService: DelegacaoAcessoService;
  let modalRefSpy: jasmine.SpyObj<NgbModalRef>;
  let formBuilder: FormBuilder = new FormBuilder();
  let mockDatePipe: jasmine.SpyObj<DatePipe>;

  beforeEach(async () => {
    const datePipeSpy = jasmine.createSpyObj('DatePipe', ['transform']);
    //modalRefSpy = jasmine.createSpyObj('NgbModalRef', ['result', 'close']);
    //modalRefSpy.result = Promise.resolve(true);
    await TestBed.configureTestingModule({
      imports: [DelegarAcessoModule, AppModule, HttpClientTestingModule],
      declarations: [DelegarAcessoComponent],
      providers: [
        { provide: NgbModalRef, useValue: modalRefSpy },
        { provide: FormBuilder, useValue: formBuilder },
        { provide: DatePipe, useValue: datePipeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DelegarAcessoComponent);
    component = fixture.componentInstance;
    // modalService = TestBed.inject(NgbModal);
    mockDatePipe = TestBed.inject(DatePipe) as jasmine.SpyObj<DatePipe>;
    alertUtils = TestBed.inject(AlertUtils);
    sarhclientservice = TestBed.inject(Sarhclientservice);
    tipoPermisaoService = TestBed.inject(EtpTipoPermissaoService);
    tipoDelegacaoService = TestBed.inject(TipoDelegacaoService);
    delegacaoAcessoService = TestBed.inject(DelegacaoAcessoService);
    modalRefSpy = TestBed.inject(NgbModalRef) as jasmine.SpyObj<any>;
    component.delegacaoForm = formBuilder.group({
      usuario: [],
      unidade: [],
      dataInicial: [new Date(), Validators.compose([Validators.required])],
      dataFinal: null,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal and call dependent methods', fakeAsync(() => {
    spyOn(component, 'getUnidades');
    spyOn(component, 'getTipoPermisaoService');
    spyOn(component, 'getTipoDelegacao');
    spyOn(component, 'getListaServidoresAutorizados');

    component.open(123, 'ETP');
    tick();

    expect(component.getUnidades).toHaveBeenCalled();
    expect(component.getTipoPermisaoService).toHaveBeenCalled();
    expect(component.getTipoDelegacao).toHaveBeenCalled();
    expect(component.getListaServidoresAutorizados).toHaveBeenCalledWith(
      123,
      'ETP'
    );
  }));

  it('should call getUnidades and update unidadeList', () => {
    const mockUnidades = [{ id: 1, descricao: 'Unidade 1', sigla: 'u' }];
    const mockUnidadesTransform = [
      {
        id: 1,
        descricao: 'Unidade 1',
        sigla: 'u',
        descricaoSigla: 'u - Unidade 1',
      },
    ];
    spyOn(sarhclientservice, 'getListaUnidades').and.returnValue(
      of(mockUnidades)
    );

    component.getUnidades();
    expect(sarhclientservice.getListaUnidades).toHaveBeenCalled();
    expect(component.unidadeList).toEqual(mockUnidadesTransform);
  });

  it('should call getTipoPermisaoService and update tipoPermisaoList', () => {
    const mockTipos = [{ id: 1, nome: 'Permissão 1', chave: 'EDICAO' }];
    spyOn(tipoPermisaoService, 'getEtpTipoPermissaoList').and.returnValue(
      of(mockTipos)
    );

    component.getTipoPermisaoService('ETP');

    expect(tipoPermisaoService.getEtpTipoPermissaoList).toHaveBeenCalled();
    expect(component.tipoPermisaoList).toEqual(mockTipos);
  });

  it('should call getTipoDelegacao and update tipoDelegacaoList', () => {
    const mockTipos = [
      { id: 1, nome: 'Tipo Delegação 1', chave: 'ELABORACAO' },
    ];
    spyOn(tipoDelegacaoService, 'getTipoDelegacaoLista').and.returnValue(
      of(mockTipos)
    );

    component.getTipoDelegacao('ETP');

    expect(tipoDelegacaoService.getTipoDelegacaoLista).toHaveBeenCalled();
    expect(component.tipoDelegacaoList).toEqual(mockTipos);
  });

  it('should call getListaServidoresAutorizados and update servidoresAutorizadosList', () => {
    const mockServidores = [
      { id: 1, nome: 'Servidor 1', idTipoDelegacao: 1, idTipoPermissao: 1 },
    ];
    const mockServidores2 = [
      {
        id: 1,
        nome: 'Servidor 1',
        idTipoDelegacao: 1,
        idTipoPermissao: 1,
        descDelegacao: 'Tipo Delegação 1',
        descPermisao: 'Permissão 1',
      },
    ];
    component.allTipoDelegacaoList = [
      { id: 1, descricao: 'Tipo Delegação 1', chave: 'ELABORACAO' },
    ];
    component.allTipoPermisaoList = [
      { id: 1, descricao: 'Permissão 1', chave: 'EDICAO' },
    ];
    spyOn(delegacaoAcessoService, 'getDelegacaoAcesso').and.returnValue(
      of(mockServidores)
    );

    component.getListaServidoresAutorizados(123, 'ETP');

    expect(delegacaoAcessoService.getDelegacaoAcesso).toHaveBeenCalledWith(
      123,
      'ETP'
    );
  });

  it('should call postDelegacaoAcesso on salvar() and handle success', fakeAsync(() => {
    spyOn(delegacaoAcessoService, 'postDelegacaoAcesso').and.returnValue(
      of({})
    );
    spyOn(alertUtils, 'handleSucess');
    spyOn(component, 'close');

    component.servidoresSelecionados = [
      { delegar: true, codMatriculaDelegado: '123', idTipoPermissao: 1 },
    ];
    component.delegacao.tipo = 'ETP';
    component.delegacao.idFomularioEtp = 123;
    component.delegacaoForm = new FormBuilder().group({
      dataInicial: [new Date()],
      dataFinal: [new Date()],
    });

    component.salvar();
    tick();

    expect(delegacaoAcessoService.postDelegacaoAcesso).toHaveBeenCalled();
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Os acessos foram definidos com sucesso!'
    );
    expect(component.close).toHaveBeenCalled();
  }));

  it('should call deleteDelegacaoAcesso on remover() and handle success', fakeAsync(() => {
    spyOn(delegacaoAcessoService, 'deleteDelegacaoAcesso').and.returnValue(
      of({})
    );
    spyOn(alertUtils, 'handleSucess');
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(component, 'listarTodosPorEtp');

    const mockDelegacao = { idDelegacao: 1 };

    component.servidoresAutorizadosList = [
      { idDelegacao: 1 },
      { idDelegacao: 2 },
    ];

    component.remover(mockDelegacao);
    tick();

    expect(delegacaoAcessoService.deleteDelegacaoAcesso).toHaveBeenCalledWith(
      1
    );
    expect(component.servidoresAutorizadosList).toEqual([{ idDelegacao: 2 }]);
    expect(component.listarTodosPorEtp).toHaveBeenCalled();
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'A permissão de acesso ao documento foi retirada com sucesso!'
    );
  }));

  it('should call listarTodosPorEtp and update usuariosAutorizados', () => {
    const mockUsuarios = [{ id: 1, nome: 'Usuário 1' }];
    spyOn(delegacaoAcessoService, 'getDelegacaoAcesso').and.returnValue(
      of(mockUsuarios)
    );

    component.delegacao = { id: 123, tipo: 'ETP' };

    component.listarTodosPorEtp();

    expect(delegacaoAcessoService.getDelegacaoAcesso).toHaveBeenCalledWith(
      123,
      'ETP'
    );
    expect(component.usuariosAutorizados).toEqual(mockUsuarios);
  });

  it('should update index when onTabChange is called', () => {
    const mockEvent = { index: 2 };
    component.onTabChange(mockEvent);
    expect(component.index).toBe(2);
  });

  it('should call getServidoresPorNome and update servidorListFilter', () => {
    const mockEvent = { query: 'João' };
    const mockServidores = [
      { id: 1, nome: 'João Silva' },
      { id: 2, nome: 'João Souza' },
    ];

    spyOn(sarhclientservice, 'getServidoresPorNome').and.returnValue(
      of(mockServidores)
    );

    component.buscarServidoresPorNome(mockEvent);

    expect(sarhclientservice.getServidoresPorNome).toHaveBeenCalledWith('João');
    expect(component.servidorListFilter).toEqual(mockServidores);
  });

  it('should call getServidoresPorUnidade and update servidoresSelecionados', () => {
    component.unidadeSelecionada = { id: 10 };

    const mockServidores = [
      { codMatriculaDelegado: '123', nome: 'Servidor 1', delegar: true },
      { codMatriculaDelegado: '456', nome: 'Servidor 2', delegar: true },
    ];
    const mockServidoresAutorizados = [
      { codMatriculaDelegado: '123', nome: 'Servidor 1', delegar: true },
    ];
    component.tipoDelegacaoList = [
      { id: 1, nome: 'Tipo Delegação 1', chave: 'ELABORACAO' },
    ];
    component.tipoPermisaoList = [
      { id: 1, nome: 'Permissão 1', chave: 'EDICAO' },
    ];

    component.servidoresAutorizadosList = mockServidoresAutorizados;

    spyOn(sarhclientservice, 'getServidoresPorUnidade').and.returnValue(
      of(mockServidores)
    );

    component.buscarServidoresPorUnidade();

    expect(sarhclientservice.getServidoresPorUnidade).toHaveBeenCalledWith(10);
    expect(component.servidoresSelecionados.length).toBe(2);
    expect(component.servidoresSelecionados[0].delegar).toBeTrue();
  });

  it('should clear servidoresSelecionados when clearServidoresSelecionados is called', () => {
    component.servidoresSelecionados = [
      { id: 1, nome: 'Servidor 1' },
      { id: 2, nome: 'Servidor 2' },
    ];

    component.clearServidoresSelecionados();

    expect(component.servidoresSelecionados.length).toBe(0);
  });

  it('should add selected server to servidoresSelecionados with delegar set to true if found in servidoresAutorizadosList', () => {
    const mockServidor = {
      codMatriculaDelegado: '123',
      nome: 'Servidor Teste',
    };
    const mockServidorAutorizado = {
      codMatriculaDelegado: '123',
      nome: 'Servidor Teste',
      delegar: false,
    };

    component.servidoresAutorizadosList = [mockServidorAutorizado];

    const event = { value: mockServidor };
    component.onServidorSelecionado(event);

    expect(component.servidoresSelecionados.length).toBe(1);
    expect(component.servidoresSelecionados[0].codMatriculaDelegado).toBe(
      '123'
    );
    expect(component.servidoresSelecionados[0].delegar).toBeTrue();
  });

  it('should add selected server to servidoresSelecionados without modifying if not found in servidoresAutorizadosList', () => {
    const mockServidor = { codMatriculaDelegado: '999', nome: 'Servidor Novo' };

    component.tipoDelegacaoList = [
      { id: 1, nome: 'Tipo Delegação 1', chave: 'ELABORACAO' },
    ];
    component.tipoPermisaoList = [
      { id: 1, nome: 'Permissão 1', chave: 'EDICAO' },
    ];
    component.servidoresAutorizadosList = [
      { codMatriculaDelegado: '123', nome: 'Servidor Teste', delegar: false },
    ];

    const event = { value: mockServidor };
    component.onServidorSelecionado(event);

    expect(component.servidoresSelecionados.length).toBe(1);
    expect(component.servidoresSelecionados[0].codMatriculaDelegado).toBe(
      '999'
    );
    expect(component.servidoresSelecionados[0].delegar).toBeUndefined();
  });

  it('should filter unidadeList based on query and update unidadeListFilter', () => {
    component.unidadeList = [
      { id: 1, descricao: 'Financeiro', descricaoSigla: 'F' },
      { id: 2, descricao: 'Recursos Humanos', descricaoSigla: 'R' },
      { id: 3, descricao: 'Tecnologia', descricaoSigla: 'tecn' },
    ];

    const mockEvent = { query: 'tecn' };

    component.buscarUnidades(mockEvent);

    expect(component.unidadeListFilter.length).toBe(1);
    expect(component.unidadeListFilter[0].descricao).toBe('Tecnologia');
  });

  it('should return empty list if no units match the query', () => {
    component.unidadeList = [
      { id: 1, descricao: 'Financeiro', descricaoSigla: 'U-1' },
      { id: 2, descricao: 'Recursos Humanos', descricaoSigla: 'U-2' },
    ];

    const mockEvent = { query: 'Marketing' };

    component.buscarUnidades(mockEvent);

    expect(component.unidadeListFilter.length).toBe(0);
  });

  it('should set unidadeSelecionada and call buscarServidoresPorUnidade when a valid unit is selected', () => {
    const mockUnidade = { id: 10, descricao: 'Tecnologia' };
    component.tipoDelegacaoList = [
      { id: 1, nome: 'Tipo Delegação 1', chave: 'ELABORACAO' },
    ];
    component.tipoPermisaoList = [
      { id: 1, nome: 'Permissão 1', chave: 'EDICAO' },
    ];
    spyOn(component, 'buscarServidoresPorUnidade');

    component.onUnidadeSelecionada({ value: mockUnidade });

    expect(component.unidadeSelecionada).toEqual(mockUnidade);
    expect(component.buscarServidoresPorUnidade).toHaveBeenCalled();
  });

  it('should clear servidoresSelecionados when no unit is selected', () => {
    component.servidoresSelecionados = [{ id: 1, nome: 'Servidor Teste' }];

    component.onUnidadeSelecionada({ value: null });

    expect(component.unidadeSelecionada).toBeNull();
    expect(component.servidoresSelecionados.length).toBe(0);
  });

  // it('should call reset and close the modal when close is called', async () => {
  //   //spyOn(component, 'reset');
  //   component.modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);
  //
  //   await component.close();
  //
  //   //expect(component.reset).toHaveBeenCalled();
  //   expect(component.modalRef.close).toHaveBeenCalled();
  // });

  // it('should not throw an error if modalRef is undefined', async () => {
  //   //component.modalRef = undefined;
  //   await expectAsync(component.close()).toBeResolved();
  // });

  it('should set _situacaoPermissao for all servidoresSelecionados and call definirPermisao', () => {
    component.servidoresSelecionados = [
      { id: 1, nome: 'Servidor 1', _situacaoPermissao: false },
      { id: 2, nome: 'Servidor 2', _situacaoPermissao: false },
    ];
    component.setarTodosServidores = true;

    spyOn(component, 'definirPermisao');

    component.setarTodos();

    expect(component.servidoresSelecionados[0].delegar).toBeTrue();
    expect(component.servidoresSelecionados[1].delegar).toBeTrue();
    expect(component.definirPermisao).toHaveBeenCalledTimes(2);
  });

  it('should set _situacaoPermissao to false when setarTodosServidores is false', () => {
    component.servidoresSelecionados = [
      { id: 1, nome: 'Servidor 1', _situacaoPermissao: true },
      { id: 2, nome: 'Servidor 2', _situacaoPermissao: true },
    ];
    component.setarTodosServidores = false;

    spyOn(component, 'definirPermisao');

    component.setarTodos();

    expect(component.servidoresSelecionados[0].delegar).toBeFalse();
    expect(component.servidoresSelecionados[1].delegar).toBeFalse();
    expect(component.definirPermisao).toHaveBeenCalledTimes(2);
  });

  it('should update usuario.idTipoPermissao when onPermissaoChange is called', () => {
    const mockUsuario = { idTipoPermissao: 1 };
    const mockEvent = { target: { value: 3 } } as unknown as Event;

    component.onPermissaoChange(mockUsuario, mockEvent);

    expect(mockUsuario.idTipoPermissao).toBe(3);
  });

  it('should update usuario.idTipoDelegacaoo when onDelegacaoChange is called', () => {
    const mockUsuario = { idTipoDelegacaoo: 1 };
    const mockEvent = { target: { value: 5 } } as unknown as Event;

    component.onDelegacaoChange(mockUsuario, mockEvent);

    expect(mockUsuario.idTipoDelegacaoo).toBe(5);
  });
});

describe('DelegarAcessoComponent - definirPermissao', () => {
  let component: DelegarAcessoComponent;
  let fixture: ComponentFixture<DelegarAcessoComponent>;
  let datePipe: jasmine.SpyObj<DatePipe>;

  beforeEach(() => {
    const datePipeSpy = jasmine.createSpyObj('DatePipe', ['transform']);

    TestBed.configureTestingModule({
      declarations: [DelegarAcessoComponent],
      imports: [
        ReactiveFormsModule,
        NgbModule
      ],
      providers: [
        FormBuilder,
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) },
        { provide: AlertUtils, useValue: jasmine.createSpyObj('AlertUtils', ['handleSucess', 'toastrErrorMsg', 'confirmDialog']) },
        { provide: Sarhclientservice, useValue: jasmine.createSpyObj('Sarhclientservice', ['getListaUnidades']) },
        { provide: EtpTipoPermissaoService, useValue: jasmine.createSpyObj('EtpTipoPermissaoService', ['getEtpTipoPermissaoList']) },
        { provide: TipoDelegacaoService, useValue: jasmine.createSpyObj('TipoDelegacaoService', ['getTipoDelegacaoLista']) },
        { provide: DelegacaoAcessoService, useValue: jasmine.createSpyObj('DelegacaoAcessoService', ['getDelegacaoAcesso']) },
        { provide: DatePipe, useValue: datePipeSpy }
      ]
    });

    fixture = TestBed.createComponent(DelegarAcessoComponent);
    component = fixture.componentInstance;
    datePipe = TestBed.inject(DatePipe) as jasmine.SpyObj<DatePipe>;

    // Setup do formulário necessário para o teste
    component.delegacaoForm = TestBed.inject(FormBuilder).group({
      usuario: [[]],
      unidade: [[]],
      dataInicial: [new Date('2023-01-15')],
      dataFinal: [new Date('2023-12-31')]
    });
  });

  describe('definirPermissao', () => {
    it('deve definir permissões quando delegar é true', () => {
      // Arrange
      const delegacaoAcesso: any = {
        delegar: true,
        dataInicioPermissao: undefined,
        dataFimPermissao: undefined
      };

      datePipe.transform.and.returnValues('15/01/2023', '31/12/2023');

      // Act
      component.definirPermisao(delegacaoAcesso);

      // Assert
      expect(delegacaoAcesso.dataInicioPermissao).toBe('15/01/2023');
      expect(delegacaoAcesso.dataFimPermissao).toBe('31/12/2023');
      expect(datePipe.transform).toHaveBeenCalledWith(component.formControl['dataInicial'].value, 'dd/MM/yyy');
      expect(datePipe.transform).toHaveBeenCalledWith(component.formControl['dataFinal'].value, 'dd/MM/yyy');
    });

    it('deve limpar permissões quando delegar é false', () => {
      // Arrange
      const delegacaoAcesso: any = {
        delegar: false,
        dataInicioPermissao: '15/01/2023',
        dataFimPermissao: '31/12/2023'
      };

      // Act
      component.definirPermisao(delegacaoAcesso);

      // Assert
      expect(delegacaoAcesso.dataInicioPermissao).toBeUndefined();
      expect(delegacaoAcesso.dataFimPermissao).toBeUndefined();
      expect(datePipe.transform).not.toHaveBeenCalled();
    });

    it('deve funcionar quando dataFinal é null', () => {
      // Arrange
      const delegacaoAcesso: any = {
        delegar: true,
        dataInicioPermissao: undefined,
        dataFimPermissao: undefined
      };

      component.delegacaoForm.patchValue({
        dataFinal: null
      });

      datePipe.transform.and.returnValues('15/01/2023', null);

      // Act
      component.definirPermisao(delegacaoAcesso);

      // Assert
      expect(delegacaoAcesso.dataInicioPermissao).toBe('15/01/2023');
      expect(delegacaoAcesso.dataFimPermissao).toBeNull();
      expect(datePipe.transform).toHaveBeenCalledWith(component.formControl['dataInicial'].value, 'dd/MM/yyy');
      expect(datePipe.transform).toHaveBeenCalledWith(null, 'dd/MM/yyy');
    });

    it('deve manter estado original do objeto para outras propriedades', () => {
      // Arrange
      const delegacaoAcesso: any = {
        delegar: true,
        id: 123,
        nome: 'João Silva',
        cargo: 'Analista',
        dataInicioPermissao: undefined,
        dataFimPermissao: undefined
      };

      datePipe.transform.and.returnValues('15/01/2023', '31/12/2023');

      // Act
      component.definirPermisao(delegacaoAcesso);

      // Assert
      expect(delegacaoAcesso.id).toBe(123);
      expect(delegacaoAcesso.nome).toBe('João Silva');
      expect(delegacaoAcesso.cargo).toBe('Analista');
      expect(delegacaoAcesso.dataInicioPermissao).toBe('15/01/2023');
      expect(delegacaoAcesso.dataFimPermissao).toBe('31/12/2023');
    });

    it('deve processar múltiplas chamadas corretamente', () => {
      // Arrange
      const delegacaoAcesso1: any = { delegar: true };
      const delegacaoAcesso2: any = { delegar: false };

      datePipe.transform.and.returnValues('15/01/2023', '31/12/2023');

      // Act
      component.definirPermisao(delegacaoAcesso1);
      component.definirPermisao(delegacaoAcesso2);

      // Assert
      expect(delegacaoAcesso1.dataInicioPermissao).toBe('15/01/2023');
      expect(delegacaoAcesso1.dataFimPermissao).toBe('31/12/2023');
      expect(delegacaoAcesso2.dataInicioPermissao).toBeUndefined();
      expect(delegacaoAcesso2.dataFimPermissao).toBeUndefined();
    });

    it('deve lidar com formato de data específico dd/MM/yyy', () => {
      // Arrange
      const delegacaoAcesso: any = { delegar: true };
      const dataEsperada = new Date('2023-06-15');
      component.delegacaoForm.patchValue({
        dataInicial: dataEsperada
      });

      datePipe.transform.and.returnValue('15/06/2023');

      // Act
      component.definirPermisao(delegacaoAcesso);

      // Assert
      expect(datePipe.transform).toHaveBeenCalledWith(dataEsperada, 'dd/MM/yyy');
      expect(delegacaoAcesso.dataInicioPermissao).toBe('15/06/2023');
    });

    it('deve preservar comportamento quando delegar é undefined', () => {
      // Arrange
      const delegacaoAcesso: any = {
        delegar: undefined,
        dataInicioPermissao: 'valor-inicial',
        dataFimPermissao: 'valor-inicial'
      };

      // Act
      component.definirPermisao(delegacaoAcesso);

      // Assert
      expect(delegacaoAcesso.dataInicioPermissao).toBeUndefined();
      expect(delegacaoAcesso.dataFimPermissao).toBeUndefined();
      expect(datePipe.transform).not.toHaveBeenCalled();
    });
  });
});
