import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { GestaoFormularioComponent } from './gestao-formulario.component';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { PrincipalModule } from '../../principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AssuntoFormularioServiceService } from 'src/app/services/assunto-formulario-service.service';
import { SituacaoFormularioServiceService } from 'src/app/services/situacao-formulario-service.service';
import { AlertUtils } from 'src/utils/alerts.util';
import { ModalConstruirFormularioComponent } from '../modal/modal-construir-formulario/modal-construir-formulario.component';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';

describe('GestaoFormularioComponent', () => {
  let component: GestaoFormularioComponent;
  let fixture: ComponentFixture<GestaoFormularioComponent>;
  let gestaoFormularioService: any;
  let assuntoFormularioService: any;
  let situacaoFormularioService: any;

  let alertUtils: AlertUtils;

    let authLoginGuard: jasmine.SpyObj<AuthLoginGuard>;

    const authLoginGuardSpy = jasmine.createSpyObj('AuthLoginGuard', ['hasPermission']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoFormularioComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [
        GestaoFormularioService,
        AlertUtils,
        ModalConstruirFormularioComponent,

        { provide: AuthLoginGuard, useValue: authLoginGuardSpy },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoFormularioComponent);
    component = fixture.componentInstance;
    gestaoFormularioService = TestBed.inject(GestaoFormularioService);
    assuntoFormularioService = TestBed.inject(AssuntoFormularioServiceService);
    situacaoFormularioService = TestBed.inject(
      SituacaoFormularioServiceService
    );
    alertUtils = TestBed.inject(AlertUtils);
    fixture.detectChanges();

    authLoginGuard = TestBed.inject(AuthLoginGuard) as jasmine.SpyObj<AuthLoginGuard>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaPage e tableLazyLoading no ngOnInit', fakeAsync(() => {
    spyOn(component, 'iniciaPage');
    spyOn(component, 'tableLazyLoading');
    spyOn(component, 'getSituacaoFormulario').and.returnValue(
      Promise.resolve()
    );
    spyOn(component, 'getAssuntoFormulario');

    component.ngOnInit();
    tick();

    expect(component.iniciaPage).toHaveBeenCalled();
    expect(component.tableLazyLoading).toHaveBeenCalled();
    expect(component.getSituacaoFormulario).toHaveBeenCalled();
    expect(component.getAssuntoFormulario).toHaveBeenCalled();
  }));

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
    spyOn(component, 'getPesquisarFormulario');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarFormulario).toHaveBeenCalled();
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
    const service: GestaoFormularioService = fixture.debugElement.injector.get(
      GestaoFormularioService
    );
    spyOn(service, 'getFormulario').and.returnValue(of(response));
    component.tableLazyLoading();
    expect(service.getFormulario).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisarFormulario', () => {
    const response: any = {};
    const service: GestaoFormularioService = fixture.debugElement.injector.get(
      GestaoFormularioService
    );
    spyOn(service, 'getFormulario').and.returnValue(of(response));
    component.getPesquisarFormulario(true);
    expect(service.getFormulario).toHaveBeenCalled();
  });

  it('deve chamar a funcao getSituacaoFormulario', () => {
    const response: any = {};
    const service: SituacaoFormularioServiceService =
      fixture.debugElement.injector.get(SituacaoFormularioServiceService);
    spyOn(service, 'getSituacaoFormulario').and.returnValue(of(response));
    component.getSituacaoFormulario();
    expect(service.getSituacaoFormulario).toHaveBeenCalled();
  });

  it('deve chamar a funcao getAssuntoFormulario', () => {
    const response: any = {};
    const service: AssuntoFormularioServiceService =
      fixture.debugElement.injector.get(AssuntoFormularioServiceService);
    spyOn(service, 'getAssuntoFormulario').and.returnValue(of(response));
    component.getAssuntoFormulario();
    expect(service.getAssuntoFormulario).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarFormulario POST', () => {
    const response: any = {};
    const objFormulario = {
      assunto: {
        id: 1,
        descricao: 'teste',
      },
      situacao: {
        id: 1,
        descricao: 'teste',
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: 1,
    };
    const service: GestaoFormularioService = fixture.debugElement.injector.get(
      GestaoFormularioService
    );
    spyOn(service, 'postFormulario').and.returnValue(of(response));
    component.gravarFormulario(objFormulario);
    expect(service.postFormulario).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarFormulario PUT', () => {
    const response: any = {};
    const objFormulario = {
      id: 1,
      assunto: {
        id: 1,
        descricao: 'teste',
      },
      situacao: {
        id: 1,
        descricao: 'teste',
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: 1,
    };
    const service: GestaoFormularioService = fixture.debugElement.injector.get(
      GestaoFormularioService
    );
    spyOn(service, 'putFormulario').and.returnValue(of(response));
    component.gravarFormulario(objFormulario);
    expect(service.putFormulario).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {
      teste: '1',
    };
    const objFormulario = {
      id: 1,
    };
    const service: GestaoFormularioService = fixture.debugElement.injector.get(
      GestaoFormularioService
    );
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);

    spyOn(service, 'deleteFormulario').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(component, 'tableLazyLoading');

    component.excluirForfmulario(objFormulario);

    expect(alert.confirmDialog).toHaveBeenCalledWith(
      `Deseja excluir o formulário?`
    );
  });

  it('deve chamar open ao chamar cadastrarFormulario', () => {
    spyOn(component.CADASTRAR_FORMULARIO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarFormulario();

    expect(component.CADASTRAR_FORMULARIO.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarFormulario', () => {
    spyOn(component.CADASTRAR_FORMULARIO, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarFormulario({ id: 1 });

    expect(component.CADASTRAR_FORMULARIO.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoFormularioFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCampos();

    expect(component.gestaoFormularioFiltroForm.reset).toHaveBeenCalled();
  });

  it('deve retornar true para uma ação permitida', () => {
    const objFormulario = {
      id: 1,
      assunto: {
        id: 1,
        descricao: 'teste',
      },
      situacao: {
        id: 1,
        descricao: 'teste',
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: 1,
      acoesFormulario: ['EDITAR'],
    };

    const result = component.acaoPermitida(objFormulario, 'EDITAR');

    expect(result).toBe(true);
  });

  it('deve retornar false para ação não permitida', () => {
    const objFormulario = {
      id: 1,
      assunto: {
        id: 1,
        descricao: 'teste',
      },
      situacao: {
        id: 1,
        descricao: 'teste',
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: 1,
      acoesFormulario: ['VERSIONAR'],
    };

    const result = component.acaoPermitida(objFormulario, 'EDITAR');

    expect(result).toBe(false);
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

  it('should call CONSTRUI_FORMULARIO.open with correct parameters in construirFormulario', async () => {
    const item = {
      id: 1,
      jsonForm: JSON.stringify({ key: 'value' }),
      jsonDados: JSON.stringify({ key: 'value' }),
      descricao: 'descricao',
      versao: 'versao',
      assunto: { id: 1, descricao: 'assunto' },
      situacao: { descricao: 'situacao' }
    };
    const service: GestaoFormularioService = fixture.debugElement.injector.get(
      GestaoFormularioService
    );

    spyOn(component, 'formularioBloqueado').and.returnValue(
      Promise.resolve({ bloqueado: false })
    );
    spyOn(service, 'putBloqueioFormulario').and.returnValue(of({}));
    spyOn(component.CONSTRUI_FORMULARIO, 'open');

    await component.construirformulario(item);

    expect(component.CONSTRUI_FORMULARIO.open).toHaveBeenCalledWith({
      id: item.id,
      idPai: undefined,
      jsonForm: item.jsonForm,
      jsonDados: item.jsonDados,
      descricao: item.descricao,
      versao: item.versao,
      assunto: item.assunto.descricao,
      assuntoId: item.assunto.id,
      situacao: item.situacao,
      visualizar: false,
    });
  });

  it('should call putFormularioJson and handle success in gravarDadosFormulario', () => {
    const mockForm = { id: '123', jsonForm: {}, jsonDados: {} };
    spyOn(gestaoFormularioService, 'putFormularioJson').and.returnValue(of({}));
    spyOn(alertUtils, 'handleSucess');

    component.gravarDadosFormulario(mockForm);

    expect(gestaoFormularioService.putFormularioJson).toHaveBeenCalledWith(
      '123',
      {
        jsonForm: mockForm.jsonForm,
        jsonDados: mockForm.jsonDados,
      }
    );
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      component.mensagens.MSG_FORMULARIO_SALVO
    );
  });

  it('should call putFormularioJson in garvarDadosInformados', () => {
    const mockData = { id: '123', jsonDados: {} };
    spyOn(gestaoFormularioService, 'putFormularioJson').and.returnValue(of({}));

    component.garvarDadosInformados(mockData);

    expect(gestaoFormularioService.putFormularioJson).toHaveBeenCalledWith(
      '123',
      {
        jsonForm: null,
        jsonDados: mockData.jsonDados,
      }
    );
  });

  it('deve chamar confirmDialog e patchFormulario em caso de confirmação', fakeAsync(() => {
    const objMock = { id: 1 };
    const acao = 'REABRIR';
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(gestaoFormularioService, 'patchFormulario').and.returnValue(of({}));
    spyOn(alertUtils, 'handleSucess');

    component.trocarSituacaoFormulario(objMock, acao);
    tick(); // Aguarda a resolução da promessa

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(gestaoFormularioService.patchFormulario).toHaveBeenCalledWith(
      1,
      'REABRIR'
    );
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Ação reabrir realizada com sucesso'
    );
  }));

  it('deve chamar copiarFormulario e handleSucess se o usuário confirmar', fakeAsync(() => {
    const itemMock = {
      id: 1,
      assunto: { descricao: 'Assunto' },
      descricao: 'Descrição',
      versao: 'V1',
    };
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(gestaoFormularioService, 'copiarFormulario').and.returnValue(of({}));
    spyOn(alertUtils, 'handleSucess');

    component.copiarFormulario(itemMock);
    tick(); // Aguarda a resolução da promessa

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(gestaoFormularioService.copiarFormulario).toHaveBeenCalledWith(1);
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Cópia realizada com sucesso'
    );
  }));

  it('deve chamar versionarFormulario e handleSucess se o usuário confirmar', fakeAsync(() => {
    const itemMock = {
      id: 1,
      assunto: { descricao: 'Assunto' },
      descricao: 'Descrição',
      versao: 'V1',
    };
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(component.VERSIONAR_FORMULARIO, 'open').and.returnValue(
      Promise.resolve(true)
    );

    component.versionarFormulario(itemMock);
    tick(); // Aguarda a resolução da promessa

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(component.VERSIONAR_FORMULARIO.open).toHaveBeenCalledWith(itemMock);
  }));

  it('deve chamar executaVersionar e handleSucess se o usuário confirmar', fakeAsync(() => {
    const itemMock = {
      id: 1,
      assunto: { descricao: 'Assunto' },
      descricao: 'Descrição',
      versao: 'V1',
    };

    spyOn(gestaoFormularioService, 'versionarFormulario').and.returnValue(
      of({})
    );
    spyOn(alertUtils, 'handleSucess');

    component.executaVersionar(itemMock);
    tick(); // Aguarda a resolução da promessa

    expect(gestaoFormularioService.versionarFormulario).toHaveBeenCalledWith(
      1,
      undefined
    );
    expect(alertUtils.handleSucess).toHaveBeenCalledWith(
      'Versão gerada com sucesso'
    );
  }));
});
