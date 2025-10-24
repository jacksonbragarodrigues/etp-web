import { ITabsModel, MenuLateralService } from '@administrativo/components';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  Components,
  Formio,
  FormioComponent,
  FormioForm,
  FormioOptions,
  FormioUtils,
} from '@formio/angular';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { getEnvironment } from 'src/app/app.component';
import { AlertUtils } from '../../../../utils/alerts.util';
import { AtualizaDadosRelatorioService } from '../../../services/atualiza-dados-relatorio.service';
import BotaoAjuda from '../../formulario/componentes-customizados-formio/botao-ajuda';
import NotaInterna from '../../formulario/componentes-customizados-formio/nota-interna';
import NumeroEtpTextField from '../../formulario/componentes-customizados-formio/numeroetp-textfield';
import ProcessoSeiTextField from '../../formulario/componentes-customizados-formio/processosei-textfield';
import ServidorSelect from '../../formulario/componentes-customizados-formio/servidores-select';
import TextoAjuda from '../../formulario/componentes-customizados-formio/texto-ajuda';
import TipoContratacaoSelect from '../../formulario/componentes-customizados-formio/tipocontratacao-select';
import UnidadeSelect from '../../formulario/componentes-customizados-formio/unidades-select';
import FunctionAux from '../../formulario/modal/modal-construir-formulario/functions.aux';
import { optionsPtBr } from '../../formulario/modal/modal-construir-formulario/options/options';
import PartesEtpSelect from '../../formulario/componentes-customizados-formio/partes-etp-select';

const editForm = Components.components.select.editForm;
UnidadeSelect.editForm = editForm;
Components.setComponent('unidadeselect', UnidadeSelect);
PartesEtpSelect.editForm = editForm;
Components.setComponent('partesetpselect', PartesEtpSelect);
ServidorSelect.editForm = editForm;
Components.setComponent('servidorselect', ServidorSelect);
ProcessoSeiTextField.editForm = editForm;
Components.setComponent('processoSeiTextField', ProcessoSeiTextField);
NumeroEtpTextField.editForm = editForm;
Components.setComponent('numeroEtpTextField', NumeroEtpTextField);
TipoContratacaoSelect.editForm = editForm;
Components.setComponent('tipocontratacaoselect', TipoContratacaoSelect);

BotaoAjuda.editForm = Components.components.content.editForm;
Components.setComponent('botaoajuda', BotaoAjuda);

TextoAjuda.editForm = Components.components.content.editForm;
Components.setComponent('textoajuda', TextoAjuda);

NotaInterna.editForm = Components.components.content.editForm;
Components.setComponent('notainterna', NotaInterna);

@Component({
  selector: 'app-modal-visualizar-formulario-padrao',
  templateUrl: './modal-visualizar-formulario-padrao.component.html',
  styleUrl: './modal-visualizar-formulario-padrao.component.scss',
})
export class ModalVisualizarFormularioPadraoComponent
  implements OnInit, OnDestroy
{
  @ViewChild('modalVisualizarFormularioPadraoComponent') private modalContent:
    | TemplateRef<ModalVisualizarFormularioPadraoComponent>
    | undefined;
  modalRef!: NgbModalRef;
  public INSTANCE_FORMIO = 'FORMULARIO';

  private observerView?: MutationObserver;
  idFormulario: number = -1;

  @ViewChild('json') jsonElement?: ElementRef;
  public form: FormioForm = { components: [] };

  @ViewChild('formio') formio: FormioComponent | undefined;

  @ViewChild('json') jsonElementRender?: ElementRef;
  public formRender: FormioForm = { components: [] };
  functionAux: FunctionAux = new FunctionAux();

  public options: FormioOptions = optionsPtBr;
  formulario: any;
  clickRetornarView: boolean = false;
  dados: any;
  pageRender: any = undefined;
  labelInit: string[] = [
    'Text Area',
    'Text Field',
    'Data Grid',
    'Number',
    'Checkbox',
    'Select',
    'Select Boxes',
    'Radio',
    'Servidores',
    'Unidades',
    'Columns',
    'Panel',
    'Table',
    'Tabs',
    'Email',
    'Url',
    'Phone Number',
    'Currency',
  ];

  tabsModel!: ITabsModel[];
  menuIndex = 0;

  parametrosView = {
    MSG_SAIR: 'Deseja sair?',
    ABA_FORMIO: 'RENDEER',
    ABA_BUILDER: 'BUILDER',
    renderizarFooter: true,
    IS_SALVAR: true,
  };

  constructor(
    public modalService: NgbModal,
    public alertUtils: AlertUtils,
    private atualizaDadosRelatorioServiceService: AtualizaDadosRelatorioService,
    private menuLateral: MenuLateralService
  ) {
    const requireLibrary = Formio.requireLibrary;
    // Formio.requireLibrary = function (name, property, src, polling) {
    //   return requireLibrary(
    //     name,
    //     property,
    //     src.replace(
    //       'https://cdn.form.io/ckeditor/19.0.0/ckeditor.js',
    //       `${getEnvironment().pathFormularioWeb}/assets/ckeditor.js`
    //     ),
    //     polling
    //   );
    // };
  }

  ngOnInit() {
    this.setupButtonsView();
    this.tabsModel = [
      { icone: 'fa fa-fw fa-building', descricao: 'Visualizador' },
      { icone: 'fa fa-fw fa-arrow-left', descricao: 'Retornar' },
    ];

    this.menuLateral.onSelect.subscribe((index: any) => {
      if (index !== '1' && index != 1) {
        this.menuIndex = index;
      }
      switch (index) {
        case '0':
          this.renderFormioView();
          break;
        case '1':
          this.close();
          break;
      }
    });
  }

  ngOnDestroy() {
    if (this.observerView) {
      this.observerView.disconnect(); // Garante que o observador seja desligado quando o componente for destruído
    }
  }

  private setupButtonsView() {
    let buttonsView = document.querySelectorAll('.formio-dialog-button');
    buttonsView.forEach((button) => this.updateButtonView(button));

    this.observerView = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          buttonsView = document.querySelectorAll('.formio-dialog-button');
          buttonsView.forEach((button) => this.updateButtonView(button));
        }
      });
    });

    this.observerView.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  updateButtonView(button: Element) {
    const buttonTextView = button.textContent;
    if (buttonTextView === 'Salvar' || buttonTextView === 'Fechar') {
      button.textContent = 'Fechar';
    }
  }

  public open(assunto: any): Promise<boolean> {
    this.clickRetornarView = false;
    this.initObjectForm();
    this.setDadosFormularioView(assunto);
    if (assunto?.jsonForm) {
      this.parametrosView.IS_SALVAR = false;
    }
    this.renderFooterView(this.parametrosView.ABA_BUILDER);
    setTimeout(() => {
      this.menuLateral.select(0);
      this.renderFormioView();
    }, 100);
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

  close() {
    if (!this.clickRetornarView) {
      this.clickRetornarView = true;
      let msg = this.parametrosView.MSG_SAIR;
      this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
        if (dataConfirme) {
          if (this.modalRef) {
            this.initObjectForm();
            this.form = { components: [] };
            this.formRender = { components: [] };
            this.modalRef.close();
          }
        } else {
          this.clickRetornarView = false;
        }
      });
    }
  }

  renderFormioView() {
    getEnvironment().formioTipo = 'SIMULADOR';
    this.renderFooterView(this.parametrosView.ABA_FORMIO);
    this.formRender = JSON.parse(this.formulario?.jsonForm);
    let elemento = document.getElementById('renderizador');
    if (elemento) {
      this.injectRenderView(elemento);
    }
  }

  private renderFooterView(aba: string) {
    if (aba === this.parametrosView.ABA_BUILDER) {
      this.parametrosView.renderizarFooter = true;
    } else {
      this.parametrosView.renderizarFooter = false;
    }
  }

  updateComponentLabelsView(event: any): void {
    const { componentView } = event;
    if (!componentView) return;

    if (this.labelInit.includes(componentView.label)) {
      componentView.label = 'Digite o rótulo';
    }
    if (this.labelInit.includes(componentView.title)) {
      componentView.title = 'Digite o rótulo';
    }
    if (componentView.title === 'Content') {
      componentView.title = '&nbsp;';
    }
    if (componentView.label === 'Content') {
      componentView.label = '&nbsp;';
    }
  }

  onChangeRendererView(param: any) {
    if (param.data !== undefined && Object.keys(param.data).length > 0) {
      this.formulario.jsonDadosTemp = param.data;
    }
  }

  onChangePagesView(param: any) {
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

  onNextView(param: any) {
    let dados = JSON.stringify(this.formulario.jsonDadosTemp);
    this.formulario.jsonDados = dados;
    this.atualizaDadosRelatorioServiceService.updateJsonDadosRelatorio(
      this.formulario.jsonDados
    );
  }
  private initObjectForm() {
    this.formulario = {
      jsonForm: '',
    };
  }

  private setDadosFormularioView(formulario: any) {
    this.formulario.jsonForm = formulario.jsonForm;
  }

  injectRenderView(elemento: HTMLElement) {
    let that = this;
    // seta enable para os campos processo-sei, numero-etp e tipo de contratação
    const formulario = JSON.parse(JSON.stringify(this.formRender, null, 4));

    let componentView = FormioUtils.getComponent(
      formulario.components,
      'PAR_TIPO_CONTRATACAO_PAR',
      true
    );

    if (componentView) componentView.disabled = false;

    componentView = FormioUtils.getComponent(
      formulario.components,
      'PAR_TIPO_CONTRATACAO_PAR',
      true
    );

    if (componentView) componentView.disabled = false;

    componentView = FormioUtils.getComponent(
      formulario.components,
      'PAR_PROCESSO_SEI_PAR',
      true
    );

    if (componentView) componentView.disabled = false;

    componentView = FormioUtils.getComponent(
      formulario.components,
      'PAR_NUMERO_ETP_PAR',
      true
    );
    if (componentView) componentView.disabled = false;
    // Fim seta campos

    if (that.INSTANCE_FORMIO === 'FORMULARIO') {
      Formio.createForm(elemento, formulario, this.options).then(
        (instanceView: any) => {
          instanceView.on('change', function () {
            setTimeout(() => {
              that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
              that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
            }, 0);

            that.onChangeRendererView(instanceView);
          });
          instanceView.on('wizardNavigationClicked', () => {
            setTimeout(() => {
              that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
              that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
            }, 0);

            that.onChangePagesView(instanceView);
          });
          instanceView.on('wizardPageSelected', () => {
            setTimeout(() => {
              that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
              that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
            }, 0);

            that.onChangePagesView(instanceView);
          });
          instanceView.on('submit', function () {
            setTimeout(() => {
              that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
              that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
            }, 0);

            that.onNextView(instanceView.submission);
          });
          instanceView.on('onCancel', function () {
            setTimeout(() => {
              that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
              that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
            }, 0);
          });
          instanceView.on('wizardCancel', () => {
            setTimeout(() => {
              that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
              that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
            }, 0);
          });
          instanceView.on('prevPage', function () {
            setTimeout(() => {
              that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
              that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
            }, 0);
          });
          instanceView.on('nextPage', function () {
            setTimeout(() => {
              that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
              that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
            }, 0);

            that.onNextView(instanceView.submission);
          });
          setTimeout(() => {
            that.addExtraButton('.btn-wizard-nav-submit', 'extraSubimit');
            that.addExtraButton('.btn-wizard-nav-next', 'extraNext');
          }, 0);
          if (instanceView) {
            const submissionData = {
              data: JSON.parse(this.formulario.jsonDados),
            };
            instanceView.setSubmission(submissionData, {
              fromSubmission: false,
            });
          }
        }
      );
    }
  }

  private addExtraButton(
    classNameUnique: string,
    uniqueNameFormulario: string
  ): void {
    const btnFechaFormulario = document.querySelector(
      '[ref="btnFechaFormulario"]'
    );

    if (btnFechaFormulario) {
      btnFechaFormulario?.parentNode?.removeChild(btnFechaFormulario);
    } else {
      console.log('Botão com ref="btnFechaFormulario" não encontrado.');
    }
    const existingButtonView = document.querySelector(
      `.${uniqueNameFormulario}`
    );
    if (existingButtonView) {
      existingButtonView.remove();
    }
    const nextButtonformularioView = document.querySelector(classNameUnique);
    if (nextButtonformularioView) {
      const extraButtonFormularioView = document.createElement('button');
      extraButtonFormularioView.innerHTML =
        '<em class="fa fa-lg fa-minus-circle float-center pt-1"></em> Fechar';
      extraButtonFormularioView.className = `w-40 btn btn-danger ml-2 ${uniqueNameFormulario}`;
      extraButtonFormularioView.onclick = () => {
        this.close();
      };
      nextButtonformularioView?.parentElement?.insertBefore(
        extraButtonFormularioView,
        nextButtonformularioView.nextSibling
      );
    }
  }

  toggleFullScreenFormularioView(element: any) {
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

  openFullScreenFormularioView(nameElement: string) {
    let meuDivView = document.getElementById(nameElement);
    this.toggleFullScreenFormularioView(meuDivView);
  }
}
