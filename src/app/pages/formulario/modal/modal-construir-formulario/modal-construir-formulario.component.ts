import { AssuntoFormularioServiceService } from 'src/app/services/assunto-formulario-service.service';
import { ITabsModel, MenuLateralService } from '@administrativo/components';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import { EtpEnvioSeiService } from 'src/app/services/etp-envio-sei.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { getEnvironment } from 'src/app/app.component';
import { AlertUtils } from '../../../../../utils/alerts.util';
import { AtualizaDadosRelatorioService } from '../../../../services/atualiza-dados-relatorio.service';
import FunctionAux from './functions.aux';
// import UndoManager from '../../../shared/undo/UndoManager';
import { AcoesEnum } from '../../../../shared/models/acoes.enum';
import { GestaoFormularioService } from '../../../../services/gestao-formulario.service';
import { ModalVersoesFormularioComponent } from '../modal-versoes-formulario/modal-versoes-formulario.component';
import { MenuItem } from 'primeng/api';
import { EnvioSeiComponent } from 'src/app/pages/etp/gestao-etp/modal/envio-sei/envio-sei.component';
import { VersionarFormularioComponent } from '../versionar-formulario/versionar-formulario.component';
import { CompararHtmlEtpNovaVersaoComponent } from '../../../etp/gestao-etp/modal/comparar-html-etp-nova-versao/comparar-html-etp-nova-versao.component';
import { DelegarAcessoComponent } from '../../../delegacao-acesso/gestao-delegacao-acesso/delegar-acesso.component';
import { optionsPtBrConstrutor } from './options/options-construtor';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';
import { FormBuilderService, ReportService } from 'form-builder-lib';


@Component({
  selector: 'modal-construir-formulario',
  templateUrl: './modal-construir-formulario.component.html',
  styleUrl: './modal-construir-formulario.component.scss',
})

export class ModalConstruirFormularioComponent implements OnInit, OnDestroy {

  @ViewChild('modalConstruirFormularioComponent') private modalContent:
    | TemplateRef<ModalConstruirFormularioComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @ViewChild('registrarSeiModalForm') private modalContentRegistrar:
    | TemplateRef<EnvioSeiComponent>
    | undefined;
  modalRefRegistrar!: NgbModalRef;

  @ViewChild('registrarLinkCustomModalForm') private modalLinkCustom:
    | TemplateRef<EnvioSeiComponent>
    | undefined;
  modalRefLinkCustom!: NgbModalRef;

  @Output() gravarJsonFormulario = new EventEmitter();
  @Output() gravarDadosInformados = new EventEmitter();
  @Output() desbloquearFormulario = new EventEmitter();
  @Output() executarAposMinutos = new EventEmitter();
  @Output() fecharModalConstruirFormulario = new EventEmitter();
  @Output() editarFormulario = new EventEmitter();
  @Output() refreshForm = new EventEmitter();

  @ViewChild('versoes_formulario', { static: false })
  VERSOES_FORMULARIO!: ModalVersoesFormularioComponent;

  @ViewChild('enviar_sei', { static: true })
  ENVIAR_SEI!: EnvioSeiComponent;

  public INSTANCE_FORMIO = 'FORMULARIO';
  public nomeArquivo: string = '';

  private observer?: MutationObserver;
  idFormulario: number = -1;
  builderIoEnabled: boolean = true;

  @ViewChild('json') jsonElement?: ElementRef;

  // Report management
  isReportPanelOpen: boolean = false;
  currentReportContent: string = '';

  @ViewChild('versionar_formulario', { static: true })
  VERSIONAR_FORMULARIO!: VersionarFormularioComponent;

  @ViewChild('htmlNovaVersao', { static: true })
  COMPARAR_FORMULARIO_HTML!: CompararHtmlEtpNovaVersaoComponent;

  @ViewChild('delegar_acesso', { static: true })
  DELEGAR_ACESSO!: DelegarAcessoComponent;

  @Output() submissionLoad = new EventEmitter<any>();
  @ViewChild('json') jsonElementRender?: ElementRef;

  functionAux: FunctionAux = new FunctionAux();

  // undoManager: UndoManager;
  isBuilderDisabled = false;

  public options: any = optionsPtBrConstrutor;

  documentoForm: any;
  linkCustomForm: any;
  textoLinkCustomForm: any;

  formulario: any;
  clickRetornar: boolean = false;
  dados: any;
  pageRender: any = undefined;

  tabsModel!: ITabsModel[];
  menuIndex = 0;

  parametros = {
    MSG_GRAVAR_CONSTRUTOR: 'As alterações feitas no Construtor ainda não foram salvas. Deseja gravar as informações ?',
    MSG_GRAVAR_SIMULADOR: 'As alterações feitas no Simulador ainda não foram salvas. Deseja gravar as informações ?',
    MSG_SAIR_CONSTRUTOR: 'Deseja sair do Construtor?',
    MSG_SAIR_SIMULADOR: 'Deseja sair do Simulador ?',
    ABA_FORMIO: 'RENDEER',
    ABA_BUILDER: 'BUILDER',
    ABA_RELATORIO: 'RELATORIO',
    ABA_COMPARAR_HTML: 'COMPARAR_HTML',
    ABA_RELATORIO_COMPLETO: 'RELATORIO_COMPLETO',
    renderizarFooter: true,
    IS_SALVAR: true,
  };

  itemMenu: boolean[] = [];
  items: MenuItem[] | undefined;
  hasPermissionConsulta: any;

  mensagens = {
    MSG_JSON_PADRAO_SALVO: 'Formulário padrão salvo com sucesso',
    MSG_SUCESSO_ALTERAR: 'Alterado com sucesso',
  };

  constructor(
    private etpEnvioSeiService: EtpEnvioSeiService,
    public modalService: NgbModal,
    public alertUtils: AlertUtils,
    private atualizaDadosRelatorioServiceService: AtualizaDadosRelatorioService,
    private assuntoFormularioServiceService: AssuntoFormularioServiceService,
    private gestaoFormularioService: GestaoFormularioService,
    private menuLateral: MenuLateralService,
    private authLoginGuard: AuthLoginGuard,
    private formBuilderService: FormBuilderService,
    private reportService: ReportService
  ) {
    // this.undoManager = new UndoManager();

    window.removeEventListener('open-sei-dialog', () => { });
    window.removeEventListener('link-custom-dialog', () => { });

    window.addEventListener('open-sei-dialog', () => {
      this.openRegistrar();
    });

    window.addEventListener('link-custom-dialog', (event: any) => {
      const selectedText = event?.detail?.selectedText || '';
      this.openLinkCustomModalConstruirFormulario(selectedText);
    });
  }

  ngOnInit() {
    this.hasPermissionConsulta = this.authLoginGuard.hasPermission([
      'MODELO_CONSULTA;F',
    ]);
    if (!this.hasPermissionConsulta) {
      this.hasPermissionConsulta = this.authLoginGuard.hasPermission([
        'MODELO_CONSULTA;R',
      ]);
    }
    this.setupButtons();
    this.montarMenu();
  }

  montarMenu() {
    this.items = [
      {
        label: 'Construtor',
        icon: 'fa fa-fw fa-cog',
        command: () => {
          this.menuIndex = 0;
          this.formBuilderService.updateState({ previewMode: false });
        },
        disabled: this.itemMenu[0],
      },
      {
        label: 'Simulador',
        icon: 'fa fa-fw fa-building',
        command: () => {
          this.menuIndex = 1;
          this.formBuilderService.updateState({ previewMode: true });
        },
        disabled: this.itemMenu[1],
      },
      {
        label: 'Relatório',
        icon: 'fa fa-fw fa-file-pdf',
        command: () => {
          this.menuIndex = 2;
          //  this.onGenerateReport();
          this.renderRelatorio();
        },
        disabled: this.itemMenu[2],
      },

      // {
      //   label: 'Comparar Versões',
      //   icon: 'fa fa-fw fa-code-compare',
      //   command: () => {
      //     this.menuIndex = 3;
      //     this.renderCompararHtml();
      //   },
      //   disabled: this.itemMenu[3],
      // },
      {
        label: 'Ações',
        icon: 'fa fa-fw fa-cog',
        items: [
          {
            icon: 'fa-solid fa-file-pen',
            label: 'Editar',
            disabled: this.itemMenu[15],
            command: () => {
              this.abrirEditarFormulario();
            },
          },
          {
            icon: 'fa fa-fw fa-unlock',
            label: 'Reabrir',
            disabled: this.itemMenu[6],
            command: () => {
              this.alterarSituacao('REABRIR');
            },
          },
          {
            icon: 'fa-lg fas fa-lock',
            label: 'Fechar',
            disabled: this.itemMenu[7],
            command: () => {
              this.alterarSituacao('FECHAR');
            },
          },
          {
            icon: 'fa-lg fas fa-ban',
            label: 'Cancelar',
            disabled: this.itemMenu[8],
            command: () => {
              this.alterarSituacao('CANCELAR');
            },
          },
          {
            icon: 'fa fa-fw fa-unlock',
            label: 'Suspender',
            disabled: this.itemMenu[11],
            command: () => {
              this.alterarSituacao('SUSPENDER');
            },
          },
          {
            label: 'Criar uma cópia',
            icon: 'fa-lg fas fa-copy',
            command: () => {
              this.copiarFormulario();
            },
            disabled: this.itemMenu[10],
          },
        ],
      },
      {
        label: 'Publicar',
        icon: 'fa-lg fas fa-paper-plane',
        command: () => {
          this.alterarSituacao('PUBLICAR');
        },
        disabled: this.itemMenu[9],
      },
      {
        label: 'Versionar',
        icon: 'fa-lg fas fa-square-plus',
        command: () => {
          this.versionarFormulario(this.formulario);
        },
        disabled: this.itemMenu[12],
      },
      {
        label: 'Versões',
        icon: 'fa fa-solid fa-code-branch',
        command: () => {
          this.getTodasVersoesFormulario(this.formulario);
        },
        disabled: this.itemMenu[13],
      },
      {
        label: 'Relatório Completo',
        icon: 'fa fa-fw fa-file-invoice',
        command: () => {
          if (
            this.formulario.jsonDados === null ||
            this.formulario.jsonDados === undefined ||
            this.formulario.jsonDados === ''
          ) {
            let dados = JSON.stringify({});
            const dadosInformados = {
              id: this.formulario?.id,
              jsonDados: dados,
            };
            this.formulario.jsonDados = dados;
            this.atualizaDadosRelatorioServiceService.updateJsonDadosRelatorio(
              this.formulario.jsonDados
            );
            this.gravarDadosInformados.emit(dadosInformados);
            this.menuIndex = 4;
            this.renderRelatorioCompleto();
          } else {
            this.menuIndex = 4;
            this.renderRelatorioCompleto();
          }
        },
        disabled: this.itemMenu[4],
      },
      {
        icon: 'fa fa-fw fa-code-compare',
        label: 'Comparar Versões',
        command: () => {
          this.menuIndex = 3;
          this.renderCompararHtml();
        },
        disabled: this.itemMenu[3],
      },
      // {
      //   label: 'Salvar Padrão',
      //   icon: 'fa fa-fw fa-save',
      //   command: () => {
      //     this.salvarAssuntoJsonPadrao();
      //   },
      //   disabled: this.itemMenu[5],
      // },
      // {
      //   icon: 'fa fa-solid fa-user-plus',
      //   label: 'Delegar Acesso',
      //   command: () => {
      //     this.DELEGAR_ACESSO.open(
      //       this.formulario.id,
      //       'FORMULARIO'
      //     );
      //   },
      //   disabled: this.itemMenu[14],
      // },
      {
        label: 'Sair',
        icon: 'fa fa-fw fa-sign-out',
        command: () => {
          this.closeFormulario();
        },
        disabled: this.itemMenu[14],
      },
    ];
  }

  salvarAssuntoJsonPadrao() {
    this.assuntoFormularioServiceService
      .putAssuntoJsonPadrao(this.formulario?.assuntoId, {
        jsonPadrao: this.formulario?.jsonForm,
      })
      .subscribe({
        next: () => {
          this.alertUtils.handleSucess(this.mensagens.MSG_JSON_PADRAO_SALVO);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect(); // Garante que o observador seja desligado quando o componente for destruído
    }
  }

  private setupButtons() {
    let buttons = document.querySelectorAll('.formio-dialog-button');
    buttons.forEach((button) => this.updateButton(button));

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          buttons = document.querySelectorAll('.formio-dialog-button');
          buttons.forEach((button) => this.updateButton(button));
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  updateButton(button: Element) {
    const buttonText = button.textContent;
    if (buttonText === 'Salvar' || buttonText === 'Fechar') {
      button.textContent = 'Fechar';
    }
  }

  public open(formulario: any): Promise<boolean> {

    this.clickRetornar = false;
    this.initObjectForm();
    this.setDadosFormulario(formulario);
    if (formulario?.jsonForm) {
      console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM");
      // console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM");
      // console.log(formulario);
      this.parametros.IS_SALVAR = false;
      // Detect whether jsonForm is a Form.io schema (has components)
      // or our internal schema (has steps) and call the correct importer.
      try {
        const parsed = typeof formulario.jsonForm === 'string'
          ? JSON.parse(formulario.jsonForm)
          : formulario.jsonForm;
        // console.log(parsed);
        if (parsed && Array.isArray(parsed.components)) {
          // console.log("PASSO 11111");
          // It's a Form.io JSON
          this.formBuilderService.importFormioSchema(JSON.stringify(parsed));
        } else if (parsed && Array.isArray(parsed.steps)) {
          // console.log("PASSO 222222");
          // It's our internal schema
          this.formBuilderService.importFormSchema(JSON.stringify(parsed));
        } else {
          // console.log("PASSO 333333");
          // Unknown format: attempt to import as internal schema as a best-effort
          this.formBuilderService.importFormSchema(JSON.stringify(parsed));
        }


        // Save loaded state as baseline for change tracking
        this.formBuilderService.saveCurrentState();
        this.formBuilderService.resetUnsavedChangesFlag();
        this.formBuilderService.resetChanges();
      } catch (err) {
        console.error('Erro ao importar jsonForm:', err);
        // Fallback attempts: try both importers with the raw string
        try {
          this.formBuilderService.importFormSchema(formulario.jsonForm);
          this.formBuilderService.saveCurrentState();
        } catch (err2) {
          try {
            this.formBuilderService.importFormioSchema(formulario.jsonForm);
            this.formBuilderService.saveCurrentState();
          } catch (err3) {
            console.error('Import fallback falhou:', err2, err3);
          }
        }
      }
    }
    this.configurarFuncionalidadesMenuLateral();

    // this.undoManager.limpar();
    //   this.renderFooter(this.parametros.ABA_BUILDER);
    this.nomeArquivo =
      'Formulário_' + formulario.assunto + '_' + 'versão_' + formulario.versao;
    this.menuIndex = 0;
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        fullscreen: true,
        size: 'xl',
      });
      this.menuLateral.onSelect.next(0);
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  private configurarFuncionalidadesMenuLateralDefault() {
    this.isBuilderDisabled = false;

    if (this.formulario.visualizar) {
      this.options.readOnly = true;
      this.toggleCssFlag(true);
      this.toggleEditMenu(true);
      this.isBuilderDisabled = true;
    }

    if (this.formulario?.situacao?.chave === 'ABERTO') {
      this.options.readOnly = false;
      this.toggleCssFlag(false);
      this.toggleEditMenu(false);
      this.isBuilderDisabled = false;
      this.desabilita([6, 9, 12]);
    }

    if (this.formulario?.situacao?.chave === 'PUBLICADO') {
      this.options.readOnly = true;
      this.toggleCssFlag(true);
      this.toggleEditMenu(true);
      this.isBuilderDisabled = true;
      this.desabilita([9, 7, 15]);
    }

    if (
      this.formulario?.situacao?.chave === 'CANCELADO' ||
      this.formulario?.situacao?.chave === 'SUSPENSO'
    ) {
      this.options.readOnly = true;
      this.toggleCssFlag(true);
      this.toggleEditMenu(true);
      this.isBuilderDisabled = true;
      this.desabilita([7, 8, 9, 11]);
    }

    if (this.formulario?.situacao?.chave === 'FECHADO') {
      this.options.readOnly = true;
      this.toggleCssFlag(true);
      this.toggleEditMenu(true);
      this.isBuilderDisabled = true;
      this.desabilita([7, 15]);
    }
  }

  private configurarFuncionalidadesMenuLateral() {
    if (this.hasPermissionConsulta) {
      this.options.readOnly = true;
      this.toggleCssFlag(true);
      this.toggleEditMenu(true);
      this.isBuilderDisabled = true;
      this.desabilita([6, 7, 8, 9, 10, 11, 12, 13, 15]);
    } else {
      this.configurarFuncionalidadesMenuLateralDefault();
    }
  }

  desabilita(index: number[]) {
    this.habilita();
    index.forEach((i) => {
      this.itemMenu[i] = true;
    });
    this.montarMenu();
  }

  habilita() {
    let j = 0;
    for (let i = 0; i <= 15; i++) {
      this.itemMenu[i] = false;
    }
  }

  saveFormulario() {
    const formJson = this.formBuilderService.exportFormSchema();
    const dataJson = this.formBuilderService.exportFormData();

    let scriptFormulario = {
      id: this.formulario?.id,
      jsonForm: formJson,
      jsonDados: dataJson,
      versao: this.formulario?.versao,
    };

    this.gravarJsonFormulario.emit(scriptFormulario);
    this.formBuilderService.resetUnsavedChangesFlag();

  }

  saveSimulador() {
    const dataJson = this.formBuilderService.exportFormData();
    console.log(dataJson);
    const dadosInformados = {
      id: this.formulario?.id,
      jsonDados: dataJson,
    };

    this.gravarDadosInformados.emit(dadosInformados);
    this.formBuilderService.resetUnsavedChangesFlag();

  }

  closeSimulador() {
    if (this.formBuilderService.hasUnsavedDataChanges()) {
      this.alertUtils.confirmDialog(this.parametros.MSG_GRAVAR_SIMULADOR).then((dataConfirme) => {
        if (!dataConfirme) {
          this.menuIndex = 0;
          this.formBuilderService.updateState({ previewMode: false });
          this.modalRef.close();
        } else {
          const dataJson = this.formBuilderService.exportFormData();
          const dadosInformados = {
            id: this.formulario?.id,
            jsonDados: dataJson,
          };
          this.gravarDadosInformados.emit(dadosInformados);
          this.menuIndex = 0;
          this.formBuilderService.updateState({ previewMode: false });
          this.modalRef.close();
        }
      });
    } else {
      this.alertUtils.confirmDialog(this.parametros.MSG_SAIR_SIMULADOR).then((dataConfirme) => {
        if (dataConfirme) {
          this.desbloquearFormulario.emit({
            id: this.idFormulario,
            bloqueado: false,
          });
          this.menuIndex = 0;
          this.formBuilderService.updateState({ previewMode: false });
          this.modalRef.close();
        } 
      });
    }
  }

  closeFormulario() {
    console.log("closeFormulario");
    if (this.formBuilderService.hasUnsavedStructuralChanges()) {
      this.alertUtils.confirmDialog(this.parametros.MSG_GRAVAR_CONSTRUTOR).then((dataConfirme) => {
        if (!dataConfirme) {
          this.modalRef.close();
        } else {
          this.gravarJsonFormulario.emit({
            id: this.idFormulario,
            jsonForm: this.formulario.jsonDados,
          });
          this.formBuilderService.resetUnsavedChangesFlag();
          this.modalRef.close();
        }

      });
    } else {
      this.alertUtils.confirmDialog(this.parametros.MSG_SAIR_CONSTRUTOR).then((dataConfirme) => {
        if (dataConfirme) {
          this.desbloquearFormulario.emit({
            id: this.idFormulario,
            bloqueado: false,
          });
          this.fecharModalConstruirFormulario.emit();
          this.modalRef.close();
        }
      });
    }
  }

  renderRelatorio() {
    this.renderFooter(this.parametros.ABA_RELATORIO);
  }

  renderRelatorioCompleto() {
    this.renderFooter(this.parametros.ABA_RELATORIO_COMPLETO);
  }

  renderCompararHtml() {
    this.renderFooter(this.parametros.ABA_COMPARAR_HTML);
  }

  private renderFooter(aba: string) {
    if (aba === this.parametros.ABA_BUILDER) {
      this.parametros.renderizarFooter = true;
    } else {
      this.parametros.renderizarFooter = false;
    }
  }

  onChangeBuilder(event: any) {
    if (!event || !event.form) return;
    this.handleComponentActions(event);
    // this.updateComponentLabels(event);
    if (event.type == 'saveComponent') {
      event.form = this.verificaConditional(
        event.component,
        event.originalComponent,
        event.form
      );
      //this.form = event.form;
      // if (this.formio) {
      //   this.formio.formio.setForm(this.form);
      // }
    }
    this.updateJsonForm(event);
    this.executarAposMinutos.emit(this.idFormulario);
  }

  private verificaConditional(
    componentAlterado: any,
    originalComponent: any,
    formJson: any
  ): any {
    // FormioUtils.eachComponent(formJson.components, (component: any) => {
    //   if (component.conditional && component.conditional.when) {
    //     const whenAnterior: string = component.conditional.when;
    //     const keyAnterior: string = originalComponent.key;
    //     if (whenAnterior.toUpperCase() == keyAnterior.toUpperCase()) {
    //       component.conditional.when = componentAlterado.key;
    //     }
    //   }
    // });

    return formJson;
  }

  private handleComponentActions(event: any): void {
    const { component } = event;
    if (!component) return;

    switch (component.type) {
      case 'radio':
      case 'selectboxes':
        this.functionAux.createKeyApiValues(event);
        break;
      case 'tabs':
        this.functionAux.createKeyApiTabs(event);
        break;
      case 'panel':
        this.functionAux.createKeyApiPanel(event);
        break;
    }
    if (event.form && event.component.type != 'panel') {
      this.functionAux.createKeyApi(event);
    }
  }

  // updateComponentLabels(event: any): void {
  //   const { component } = event;
  //   if (!component) return;

  //   if (this.labelInit.includes(component.label)) {
  //     component.label = 'Digite o rótulo';
  //   }
  //   if (this.labelInit.includes(component.title)) {
  //     component.title = 'Digite o rótulo';
  //   }
  //   if (component.title === 'Content') {
  //     component.title = '&nbsp;';
  //   }
  //   if (component.label === 'Content') {
  //     component.label = '&nbsp;';
  //   }
  // }

  private updateJsonForm(event: any): void {
    this.formulario.jsonForm = JSON.stringify(event.form);
  }

  private updateWizardJsonForm(form: any): void {
    this.formulario.jsonForm = JSON.stringify(form);
  }

  onChangeRenderer(param: any) {
    if (param.data !== undefined && Object.keys(param.data).length > 0) {
      this.formulario.jsonDadosTemp = param.data;
    }
  }

  onChangePages(param: any) {
    if (!param.isValid() && this.pageRender !== undefined) {
      param.setPage(this.pageRender);
    } else {
      this.pageRender = undefined;
    }
    if (param.isValid()) {
      this.pageRender = undefined;
    } else {
      if (this.pageRender === undefined) {
        this.pageRender = param.page;
      }
    }
  }

  onNext(param: any) {
    let dados = JSON.stringify(this.formulario.jsonDadosTemp);
    const dadosInformados = {
      id: this.formulario?.id,
      jsonDados: dados,
    };
    this.formulario.jsonDados = dados;
    this.atualizaDadosRelatorioServiceService.updateJsonDadosRelatorio(
      this.formulario.jsonDados
    );
    this.gravarDadosInformados.emit(dadosInformados);
  }
  private initObjectForm() {
    this.formulario = {
      jsonForm: '',
      jsonDados: '',
      jsonDadosTemp: '',
      descricao: '',
      id: '',
      versao: '',
      situacao: '',
      assuntoId: '',
      assunto: '',
      visualizar: false,
      idPai: '',
    };
  }

  private setDadosFormulario(formulario: any) {


     this.gestaoFormularioService
      .getFormularioById(formulario.id)
      .subscribe({
        next: (data: any) => {
          this.formulario.jsonDados = data.jsonDados;
          this.formulario.jsonForm = data.jsonForm;
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });

    this.formulario.id = formulario.id;
    this.formulario.descricao = formulario.descricao;
    this.formulario.versao = formulario.versao;
    this.formulario.situacao = formulario.situacao;
    this.formulario.assuntoId = formulario.assuntoId;
    this.formulario.assunto = formulario.assunto;
    this.idFormulario = formulario.id;
    this.formulario.visualizar = formulario.visualizar;
    this.formulario.idPai = formulario.idPai;
  }



  toggleFullScreenFormulario(element: any) {
    if (!document.fullscreenElement) {
      // Tenta colocar o elemento específico em tela cheia
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      // Sai do modo de tela cheia se já estiver em tela cheia
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  openFullScreenFormulario(nameElement: string) {
    let meuDiv = document.getElementById(nameElement);
    this.toggleFullScreenFormulario(meuDiv);
  }

  alterarSituacao(acao: any) {
    const obj = {
      id: this.formulario.id,
      situacao: Object.values(AcoesEnum).find((value) => value === acao),
    };
    let msg = `Deseja ${obj.situacao?.toLowerCase()} o formulário?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoFormularioService
          .patchFormulario(obj.id, obj.situacao)
          .subscribe({
            next: () => {
              this.alertUtils.handleSucess(
                `Ação ` + obj.situacao?.toLowerCase() + ` realizada com sucesso`
              );
              this.gestaoFormularioService
                .getFormularioById(this.formulario.id)
                .subscribe({
                  next: (data: any) => {
                    const novoFormulario = this.formulario;
                    novoFormulario.situacao = data.situacao;
                    this.reloadFormulario();
                    // this.navegarFormulario(novoFormulario);
                  },
                  error: (e: any) => {
                    this.alertUtils.toastrErrorMsg(e);
                  },
                });
            },
            error: (e: any) => {
              this.alertUtils.toastrErrorMsg(e);
            },
          });
      }
    });
  }

  // navegarFormulario(formulario: any) {
  //   formulario.visualizar = false;
  //   if (
  //     formulario.situacao?.chave === 'PUBLICADO' ||
  //     formulario.situacao?.chave === 'FECHADO'
  //   ) {
  //     formulario.visualizar = true;
  //   }

  //   this.open(formulario);
  // }

  copiarFormulario() {
    let msg = `
    Deseja criar um cópia com base no Formulário - ${this.formulario.descricao} - Versão: ${this.formulario.versao}?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoFormularioService
          .copiarFormulario(this.formulario.id)
          .subscribe({
            next: (data: any) => {
              const novoFormulario = data;
              this.reloadFormulario();
              // this.navegarFormulario(novoFormulario);
            },
            error: (e: any) => {
              this.alertUtils.toastrErrorMsg(e);
            },
          });
        this.alertUtils.handleSucess(`Cópia realizada com sucesso`);
      }
    });
  }

  versionarFormulario(item: any) {
    let msg = `
    Deseja criar uma versão com base no Formulário - ${this.formulario.descricao}?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.VERSIONAR_FORMULARIO.open(item);

        this.alertUtils.handleSucess(`Versão realizada com sucesso`);
      }
    });
  }

  executaVersionar(item: any) {
    this.gestaoFormularioService
      .versionarFormulario(item.id, item.motivo)
      .subscribe({
        next: (data: any) => {
          const novoFormulario = data;
          this.reloadFormularioVersaoMotivo();
          // this.navegarFormulario(novoFormulario);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  reloadFormularioVersaoMotivo() {
    if (this.modalRef) {
      this.initObjectForm();
      this.VERSIONAR_FORMULARIO.closeFormulario();
      this.fecharModalConstruirFormulario.emit();
      this.modalRef.close();
    }
  }

  reloadFormulario() {
    if (this.modalRef) {
      this.initObjectForm();
      this.fecharModalConstruirFormulario.emit();
      this.modalRef.close();
    }
  }

  reloadFormularioVersoes() {
    if (this.modalRef) {
      this.initObjectForm();
      this.fecharModalConstruirFormulario.emit();
      this.VERSOES_FORMULARIO.close();
      this.modalRef.close();
    }
  }

  construirformulario(item: any) {
    this.reloadFormularioVersoes();
    // this.navegarFormulario(item);
  }

  getTodasVersoesFormulario(item: any, pageEvent?: any) {
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
    };
    this.gestaoFormularioService
      .getTodasVersoesFormulario(item.id, objParams)
      .subscribe({
        next: (data: any) => {
          let versoes = data.content || [];
          let totalElements = data.totalElements;
          this.VERSOES_FORMULARIO.open(versoes, totalElements, data?.descricao);
        },
        error: (e: any) => {
          this.alertUtils.handleError(e);
        },
      });
  }

  private abrirEditarFormulario() {
    const forulario = {
      id: this.formulario?.id,
      assunto: {
        id: this.formulario?.assuntoId,
      },
      situacao: {
        id: this.formulario?.situacao.id,
      },
      descricao: this.formulario?.descricao,
      jsonForm: this.formulario?.jsonForm,
      idPai: this.formulario?.idPai,
      versao: this.formulario?.versao,
      setarPadrao: true,
    };
    this.editarFormulario.emit(forulario);
  }

  verificaMenuWizard(): boolean {
    let menuAtual, menuAnterior;

    // if (this.form && this.form.components) {
    //   menuAtual = this.form.components
    //     .filter((comp: any) => comp.type === 'panel')
    //     .map(({ id, components, ...rest }) => rest); // Remove internal components
    // }

    // if (this.formAnterior == null) {
    //   this.formAnterior = this.form;
    // }

    // if (this.formAnterior && this.formAnterior.components) {
    //   menuAnterior = this.formAnterior.components
    //     .filter((comp: any) => comp.type === 'panel')
    //     .map(({ id, components, ...rest }) => rest); // Remove internal components
    // }

    if (JSON.stringify(menuAtual) !== JSON.stringify(menuAnterior)) {
      return true;
    }

    return false;
  }

  toggleCssFlag(desabilitar: boolean) {
    const styleId = 'desabilitar-textfield-css';
    const existingStyle = document.getElementById(styleId);

    if (desabilitar && !existingStyle) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
      .builder-sidebar .formcomponent {
        pointer-events: none;
        opacity: 0.5;
      }
    `;
      document.head.appendChild(style);
    } else if (!desabilitar && existingStyle) {
      existingStyle.remove();
    }
  }

  toggleEditMenu(disable: boolean) {
    const styleId = 'disable-edit-buttons';
    const existing = document.getElementById(styleId);

    if (disable && !existing) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
      .builder-component .component-settings-button {
        pointer-events: none;
        opacity: 0.5;
      }
    `;
      document.head.appendChild(style);
    } else if (!disable && existing) {
      existing.remove();
    }
  }

  public openRegistrar(): Promise<boolean> {
    this.closeRegistrarLinkCustom();
    return new Promise<boolean>((resolve) => {
      this.modalRefRegistrar = this.modalService.open(
        this.modalContentRegistrar,
        {
          centered: true,
          backdrop: 'static', // Não fechar ao clicar fora
          keyboard: false,
          fullscreen: false,
          windowClass: 'modal-link-custom',
        }
      );
      this.modalRefRegistrar.result.then((result) => {
        resolve(result);
      });
    });
  }

  public openLinkCustomModalConstruirFormulario(texto: any): Promise<boolean> {
    this.closeRegistrarFormModalConstruirFormulario();
    this.textoLinkCustomForm = texto;
    this.linkCustomForm = '';

    return new Promise<boolean>((resolve) => {
      this.modalRefLinkCustom = this.modalService.open(this.modalLinkCustom, {
        centered: true,
        backdrop: 'static', // Não fechar ao clicar fora
        keyboard: false,
        fullscreen: false,
        windowClass: 'modal-link-custom',
      });
      this.modalRefLinkCustom.result.then((result) => {
        resolve(result);
      });
    });
  }

  registrarEnvioseiEtpFormModalConstruirFormulario() {
    const dsdosDocumento = {
      procedimento: this.documentoForm,
    };

    this.etpEnvioSeiService.consultarDocumentoSei(dsdosDocumento).subscribe({
      next: (documentoResposta: any) => {
        if (documentoResposta) {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('sei-dialog-response', {
                detail: {
                  link: documentoResposta.linkAcesso,
                  text: documentoResposta.documentoFormatado,
                },
              })
            );
          }, 0);
        } else {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('sei-dialog-response', {
                detail: { link: null, text: null },
              })
            );
          }, 0);
        }
        this.closeRegistrarFormModalConstruirFormulario();
      },
    });
  }

  closeRegistrarFormModalConstruirFormulario() {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('sei-dialog-response', {
          detail: { link: null, text: null },
        })
      );
    }, 1000);

    if (this.modalRefRegistrar) {
      this.modalRefRegistrar.close();
    }
  }

  registrarLinkCustomFormModalConstruirFormulario() {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('link-custom-dialog-response', {
          detail: {
            link: this.linkCustomForm,
            text: this.textoLinkCustomForm,
          },
        })
      );
    }, 0);
    this.closeRegistrarLinkCustom();
  }

  closeRegistrarLinkCustom() {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('link-custom-dialog-response', {
          detail: { link: null, text: null },
        })
      );
    }, 0);

    if (this.modalRefLinkCustom) {
      this.modalRefLinkCustom.close();
    }
  }

  onGenerateReport(): void {
    try {
      this.currentReportContent = this.reportService.generateHTMLReport();
      this.isReportPanelOpen = false;
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.open();
        reportWindow.document.write(this.currentReportContent);
        reportWindow.document.close();
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório: ' + error);
    }
  }

  handleFormBuilderAction(event: { action: string, data?: any }): void {
    switch (event.action) {
      case 'saveFormulario':
        this.saveFormulario();
        break;
      case 'closeFormulario':
        this.closeFormulario();
        break;
      case 'undoLastActionFormulario':
        this.undoLastActionFormulario();
        break;
      default:
        console.warn('Ação não reconhecida:', event.action);
    }
  }

  handleFormBuilderActionSimulador(event: { action: string, data?: any }): void {
    console.log("handleFormBuilderActionSimulador >>>>>>>>>>>>>>>>>>>....")
    switch (event.action) {
      case 'saveSimulador':
        this.saveSimulador();
        break;
      case 'closeSimulador':
        this.closeSimulador();
        break;
      default:
        console.warn('Ação não reconhecida:', event.action);
    }
  }

  undoLastActionFormulario() {
    console.log("undoLastActionFormulario")
    this.formBuilderService.resetChanges();
  }


}

