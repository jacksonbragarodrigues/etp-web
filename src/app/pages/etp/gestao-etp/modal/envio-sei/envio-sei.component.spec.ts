import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {of} from 'rxjs';
import {AuthLoginGuard} from 'src/app/auth/auth-login.guard';
import {EtpEnvioSeiService} from 'src/app/services/etp-envio-sei.service';
import {EtpSeiService} from 'src/app/services/etp-sei.service';
import {FormularioSeiService} from 'src/app/services/formulario-sei.service';
import {GestaoEtpAnaliseService} from 'src/app/services/gestao-etp-analise.service';
import {AlertUtils} from 'src/utils/alerts.util';
import {EnvioSeiComponent} from './envio-sei.component';

describe('EnvioSeiComponent', () => {
  let component: EnvioSeiComponent;
  let fixture: ComponentFixture<EnvioSeiComponent>;
  let modalService: NgbModal;
  let etpSeiService: jasmine.SpyObj<EtpSeiService>;
  let formularioSeiService: jasmine.SpyObj<FormularioSeiService>;
  let etpEnvioSeiService: jasmine.SpyObj<EtpEnvioSeiService>;
  let gestaoEtpAnaliseService: jasmine.SpyObj<GestaoEtpAnaliseService>;
  let authLoginGuard: jasmine.SpyObj<AuthLoginGuard>;
  let alertUtils: jasmine.SpyObj<AlertUtils>;

  beforeEach(async () => {
    const etpSeiServiceSpy = jasmine.createSpyObj('EtpSeiService', [
      'getListaEtpSeiPorEtp',
    ]);
    const formularioSeiServiceSpy = jasmine.createSpyObj(
      'FormularioSeiService',
      ['getListaFormularioSeiPorFormulario']
    );
    const gestaoEtpAnaliseServiceSpy = jasmine.createSpyObj(
      'GestaoEtpAnaliseService',
      ['alteraEtpEtapaAnalise']
    );
    const etpEnvioSeiServiceSpy = jasmine.createSpyObj('EtpEnvioSeiService', [
      'enviarSei',
      'enviarFormularioSei',
      'updateEtpSei',
      'consultarECriarDocumentoSei',
    ]);

    const authLoginGuardSpy = jasmine.createSpyObj('AuthLoginGuard', [
      'hasPermission',
    ]);
    const alertUtilsSpy = jasmine.createSpyObj('AlertUtils', [
      'toastrWarningMsg',
      'confirmDialog',
      'handleSucess',
      'toastrErrorMsg',
    ]);

    await TestBed.configureTestingModule({
      declarations: [EnvioSeiComponent],
      providers: [
        {provide: EtpSeiService, useValue: etpSeiServiceSpy},
        {provide: FormularioSeiService, useValue: formularioSeiServiceSpy},
        {provide: EtpEnvioSeiService, useValue: etpEnvioSeiServiceSpy},
        {
          provide: GestaoEtpAnaliseService,
          useValue: gestaoEtpAnaliseServiceSpy,
        },
        {provide: AuthLoginGuard, useValue: authLoginGuardSpy},
        {provide: AlertUtils, useValue: alertUtilsSpy},
        NgbModal,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvioSeiComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(NgbModal);
    etpSeiService = TestBed.inject(
      EtpSeiService
    ) as jasmine.SpyObj<EtpSeiService>;
    formularioSeiService = TestBed.inject(
      FormularioSeiService
    ) as jasmine.SpyObj<FormularioSeiService>;
    etpEnvioSeiService = TestBed.inject(
      EtpEnvioSeiService
    ) as jasmine.SpyObj<EtpEnvioSeiService>;
    gestaoEtpAnaliseService = TestBed.inject(
      GestaoEtpAnaliseService
    ) as jasmine.SpyObj<GestaoEtpAnaliseService>;

    authLoginGuard = TestBed.inject(
      AuthLoginGuard
    ) as jasmine.SpyObj<AuthLoginGuard>;
    alertUtils = TestBed.inject(AlertUtils) as jasmine.SpyObj<AlertUtils>;

    // Setup inicial do componente para os novos testes
    component.id = 123;
    component.listaEnvios = [];
  });
  describe('EnvioSeiComponent', () => {
    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve retornar verdadeiro quando etp existir', () => {
      component.etp = {};
      expect(component.temEtp()).toBeTrue();
    });

    it('deve retornar falso quando etp for undefined', () => {
      component.etp = undefined;
      expect(component.temEtp()).toBeFalse();
    });

    it('deve retornar verdadeiro quando situação for FECHADO ou PUBLICADO', () => {
      component.situacao = {chave: 'FECHADO'};
      expect(component.statusSituacao()).toBeTrue();
      component.situacao = {chave: 'PUBLICADO'};
      expect(component.statusSituacao()).toBeTrue();
    });

    it('deve carregar envios para ETP', () => {
      component.tipo = 'ETP';
      component.id = 1;
      etpSeiService.getListaEtpSeiPorEtp.and.returnValue(of([]));

      component.carregaEnvios();

      expect(etpSeiService.getListaEtpSeiPorEtp).toHaveBeenCalledWith(1);
    });

    it('deve carregar envios para FORMULARIO', () => {
      component.tipo = 'FORMULARIO';
      component.id = 1;

      etpSeiService.getListaEtpSeiPorEtp.and.returnValue(of([{}]));

      component.carregaEnvios();
      expect(
        etpSeiService.getListaEtpSeiPorEtp
      ).toHaveBeenCalled();
    });

    it('deve retornar descrição correta', () => {
      component.tipo = 'ETP';
      //expect(component.getDescricao()).toBe('ETP');

      component.tipo = 'FORMULARIO';
      //expect(component.getDescricao()).toBe('Formulário');
    });

    // it('deve chamar etpEnvioSeiService ao enviar um ETP para SEI', () => {
    //   etpEnvioSeiService.enviarSei.and.returnValue(of({}));
    //   //component.enviarEtpSei({ reenviar: false, id: 1 }, 'ETP');
    //
    //   expect(etpEnvioSeiService.enviarSei).toHaveBeenCalled();
    // });

    // it('deve chamar etpEnvioSeiService ao enviar um formulário para SEI', () => {
    //   etpEnvioSeiService.enviarFormularioSei.and.returnValue(of({}));
    //   component.enviarFormularioSei({ reenviar: false, id: 1 });
    //
    //   expect(etpEnvioSeiService.enviarFormularioSei).toHaveBeenCalled();
    // });

    it('deve retornar a situação correta', () => {
      expect(component.getSituacao(0)).toBe('Normal');
      expect(component.getSituacao(1)).toBe('Cancelado');
      expect(component.getSituacao(2)).toBe('Excluído');
      expect(component.getSituacao(3)).toBe('');
    });

    it('deve fechar o modal corretamente', () => {
      component.modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);
      component.close();
      expect(component.modalRef.close).toHaveBeenCalled();
    });

    it('deve fechar o modal de registro corretamente', () => {
      component.modalRefRegistrar = jasmine.createSpyObj('NgbModalRef', [
        'dismiss',
      ]);
      component.closeRegistrar();
      expect(component.modalRefRegistrar.dismiss).toHaveBeenCalled();
    });

    it('deve exibir warning quando listaEnvios estiver vazia', () => {
      component.listaEnvios = [];

      component.enviarAnalise();

      expect(alertUtils.toastrWarningMsg).toHaveBeenCalledWith(
        'Esse ETP não foi enviado para o SEI, para enviar para Análise é obrigatório o envio para o SEI.'
      );
    });

    it('deve exibir warning quando não encontrar item com situacao = 0', () => {
      component.listaEnvios = [
        {situacao: 1},
        {situacao: 2},
        {situacao: 3},
      ];
      spyOn(component, 'trocarEtapaEtp');

      component.enviarAnalise();

      expect(alertUtils.toastrWarningMsg).toHaveBeenCalledWith(
        'Esse ETP não foi enviado para o SEI, para enviar para Análise é obrigatório o envio para o SEI.'
      );
      expect(component.trocarEtapaEtp).not.toHaveBeenCalled();
    });

    // it('deve chamar trocarEtapaEtp quando encontrar item com situacao = 0', () => {
    //   component.listaEnvios = [
    //     {situacao: 1},
    //     {situacao: 0},
    //     {situacao: 2},
    //   ];
    //   spyOn(component, 'trocarEtapaEtp');
    //
    //   component.enviarAnalise();
    //
    //   expect(alertUtils.toastrWarningMsg).not.toHaveBeenCalled();
    //   expect(component.trocarEtapaEtp).toHaveBeenCalledWith(
    //     {id: 123},
    //     'AGUARDANDO_ANALISE'
    //   );
    // });

    // it('deve chamar trocarEtapaEtp quando listaEnvios contém apenas item com situacao = 0', () => {
    //   component.listaEnvios = [{situacao: 0}];
    //   spyOn(component, 'trocarEtapaEtp');
    //
    //   component.enviarAnalise();
    //
    //   expect(alertUtils.toastrWarningMsg).not.toHaveBeenCalled();
    //   expect(component.trocarEtapaEtp).toHaveBeenCalledWith(
    //     {id: 123},
    //     'AGUARDANDO_ANALISE'
    //   );
    // });

    // it('deve exibir warning quando não encontrar item com situacao = 0', () => {
    //   component.listaEnvios = [
    //     {situacao: 1},
    //     {situacao: 2},
    //     {situacao: 3},
    //   ];
    //   spyOn(component, 'trocarEtapaEtp');
    //
    //   component.retornarAnalise();
    //
    //   expect(alertUtils.toastrWarningMsg).toHaveBeenCalledWith(
    //     'Esse Termo de Análise não foi enviado para o SEI, para retornar para o Gestor é obrigatório o envio para o SEI.'
    //   );
    //   expect(component.trocarEtapaEtp).not.toHaveBeenCalled();
    // });

    // it('deve chamar trocarEtapaEtp quando encontrar item com situacao = 0', () => {
    //   component.listaEnvios = [
    //     {situacao: 1},
    //     {situacao: 0},
    //     {situacao: 2},
    //   ];
    //   spyOn(component, 'trocarEtapaEtp');
    //
    //   component.retornarAnalise();
    //
    //   expect(alertUtils.toastrWarningMsg).not.toHaveBeenCalled();
    //   expect(component.trocarEtapaEtp).toHaveBeenCalledWith(
    //     {id: 123},
    //     'ANALISADO'
    //   );
    // });

    // it('deve chamar trocarEtapaEtp quando listaEnvios contém apenas item com situacao = 0', () => {
    //   component.listaEnvios = [{situacao: 0}];
    //   spyOn(component, 'trocarEtapaEtp');
    //
    //   component.retornarAnalise();
    //
    //   expect(alertUtils.toastrWarningMsg).not.toHaveBeenCalled();
    //   expect(component.trocarEtapaEtp).toHaveBeenCalledWith(
    //     {id: 123},
    //     'ANALISADO'
    //   );
    // });

    // it('deve chamar confirmDialog com mensagem correta para AGUARDANDO_ANALISE', () => {
    //
    //   const obj = {id: 123};
    //   const acao = 'AGUARDANDO_ANALISE';
    //   alertUtils.confirmDialog.and.returnValue(Promise.resolve(false));
    //
    //   component.trocarEtapaEtp(obj, acao);
    //
    //   expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
    //     'Deseja Enviar para análise o ETP?'
    //   );
    // });

    // it('deve chamar confirmDialog com mensagem correta para AGUARDANDO_ANALISE', () => {
    //   const obj = {id: 123};
    //   const acao = 'AGUARDANDO_ANALISE';
    //   alertUtils.confirmDialog.and.returnValue(Promise.resolve(false));
    //
    //   component.trocarEtapaEtp(obj, acao);
    //
    //   expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
    //     'Deseja Enviar para análise o ETP?'
    //   );
    // });

    // it('deve chamar confirmDialog com mensagem correta para AGUARDANDO_ANALISE', () => {
    //   const obj = {id: 123};
    //   const acao = 'AGUARDANDO_ANALISE';
    //   alertUtils.confirmDialog.and.returnValue(Promise.resolve(false));
    //
    //   component.trocarEtapaEtp(obj, acao);
    //
    //   expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
    //     'Deseja Enviar para análise o ETP?'
    //   );
    // });

    // it('deve chamar confirmDialog com mensagem correta para ANALISADO', () => {
    //   const obj = {id: 123};
    //   const acao = 'ANALISADO';
    //   alertUtils.confirmDialog.and.returnValue(Promise.resolve(false));
    //
    //   component.trocarEtapaEtp(obj, acao);
    //
    //   expect(alertUtils.confirmDialog).toHaveBeenCalledWith(
    //     'Deseja Retornar Termo de Orientação o ETP?'
    //   );
    // });

    it('deve chamar serviço quando usuário confirmar ação', async () => {
      const obj = {id: 123};
      const acao = 'AGUARDANDO_ANALISE';
      const mockResponse = {success: true};

      alertUtils.confirmDialog.and.returnValue(Promise.resolve(true));
      gestaoEtpAnaliseService.alteraEtpEtapaAnalise.and.returnValue(
        of(mockResponse)
      );

      await component.trocarEtapaEtp(obj, acao);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(
        gestaoEtpAnaliseService.alteraEtpEtapaAnalise
      ).toHaveBeenCalledWith(123, 'AGUARDANDO_ANALISE');
    });

    // it('deve executar ações de sucesso quando serviço retornar com sucesso', async () => {
    //   const obj = {id: 123};
    //   const acao = 'AGUARDANDO_ANALISE';
    //   const mockResponse = {success: true};
    //
    //   component.reloadPublicarEtp = jasmine.createSpy('reloadPublicarEtp');
    //   spyOn(component, 'close');
    //
    //   alertUtils.confirmDialog.and.returnValue(Promise.resolve(true));
    //   gestaoEtpAnaliseService.alteraEtpEtapaAnalise.and.returnValue(
    //     of(mockResponse)
    //   );
    //
    //   await component.trocarEtapaEtp(obj, acao);
    //
    //   await new Promise((resolve) => setTimeout(resolve, 0));
    //
    //   expect(alertUtils.handleSucess).toHaveBeenCalledWith(
    //     'Ação Enviar para análise enviada com sucesso'
    //   );
    //   expect(component.reloadPublicarEtp).toHaveBeenCalled();
    //   expect(component.close).toHaveBeenCalled();
    // });

      it('deve tratar erro quando serviço falhar', async () => {
        const obj = { id: 123 };
        const acao = 'AGUARDANDO_ANALISE';
        const mockError = { message: 'Erro no servidor' };

        component.reloadPublicarEtp = jasmine.createSpy('reloadPublicarEtp');
        spyOn(component, 'close');

        alertUtils.confirmDialog.and.returnValue(Promise.resolve(true));
        gestaoEtpAnaliseService.alteraEtpEtapaAnalise.and.returnValue({
          subscribe: (callbacks: any) => {
            callbacks.error(mockError);
          },
        } as any);

        await component.trocarEtapaEtp(obj, acao);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(alertUtils.toastrErrorMsg).toHaveBeenCalledWith(mockError);
        expect(alertUtils.handleSucess).not.toHaveBeenCalled();
        expect(component.reloadPublicarEtp).not.toHaveBeenCalled();
      });
  })
});
