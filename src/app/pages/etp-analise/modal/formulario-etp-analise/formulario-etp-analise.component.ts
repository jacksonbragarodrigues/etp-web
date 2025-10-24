import { Page } from '@administrativo/components';
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
import { Formio, FormioForm, FormioUtils, Templates } from '@formio/angular';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { getEnvironment } from 'src/app/app.component';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';
import { EtapasEnum } from 'src/app/enums/etapas.enum';
import { CadastrarEtpComponent } from 'src/app/pages/etp/gestao-etp/modal/cadastrar-etp/cadastrar-etp.component';
import { CompararHtmlEtpNovaVersaoComponent } from 'src/app/pages/etp/gestao-etp/modal/comparar-html-etp-nova-versao/comparar-html-etp-nova-versao.component';
import { EnvioSeiComponent } from 'src/app/pages/etp/gestao-etp/modal/envio-sei/envio-sei.component';
import { OpenEtp } from 'src/app/pages/etp/gestao-etp/modal/formulario-etp/formulario-etp.component';
import { ListarLogsEtpComponent } from 'src/app/pages/etp/gestao-etp/modal/listar-logs-etp/listar-logs-etp.component';
import { optionsPtBr } from 'src/app/pages/formulario/modal/modal-construir-formulario/options/options';
import { EtpEnvioSeiService } from 'src/app/services/etp-envio-sei.service';
import { GestaoEtpAnaliseService } from 'src/app/services/gestao-etp-analise.service';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { AcoesEnum } from 'src/app/shared/models/acoes.enum';
import { AlertUtils } from 'src/utils/alerts.util';
import { FichaAnaliseAnalistasService } from '../../../../services/ficha-analise-analistas.service';
import { FichaAnaliseService } from '../../../../services/ficha-analise.service';
import { FichaAnaliseComponent } from '../ficha-analise/ficha-analise.component';

@Component({
  selector: 'app-formulario-etp-analise',
  templateUrl: './formulario-etp-analise.component.html',
  styleUrl: './formulario-etp-analise.component.scss',
})
export class FormularioEtpAnaliseComponent implements OnInit, OnDestroy {
  @ViewChild('registrarSeiModalForm') private modalContentAnaliseRegistrar:
    | TemplateRef<EnvioSeiComponent>
    | undefined;
  modalRefRegistrarAnalise!: NgbModalRef;

  @ViewChild('registrarLinkCustomModalForm') private modalLinkCustom:
    | TemplateRef<EnvioSeiComponent>
    | undefined;
  modalRefLinkCustomAnalise!: NgbModalRef;

  @ViewChild('formulario_etp_analise', { static: true })
  private modalContentAnalise:
    | TemplateRef<FormularioEtpAnaliseComponent>
    | undefined;
  modalRefAnalise!: NgbModalRef;

  @ViewChild('cadastrar_etp_analise', {
    static: true,
  })
  CADASTRAR_ETP_ANALISE!: CadastrarEtpComponent;

  @ViewChild('logsEtp', { static: true })
  LOGS_ETP_ANALISE!: ListarLogsEtpComponent;

  @ViewChild('ENVIAR_SEI_ANALISE', { static: true })
  ENVIAR_SEI_ANALISE!: EnvioSeiComponent;

  @ViewChild('htmlNovaVersao', { static: true })
  COMPARAR_FORMULARIO_HTML_ANALISE!: CompararHtmlEtpNovaVersaoComponent;

  @ViewChild('fichaAnalise', { static: true })
  FICHA_ANALISE!: FichaAnaliseComponent;

  @Output() gravarDadosInformadosAnalise = new EventEmitter();
  @Output() fecharModalFormularioEtpAnalise = new EventEmitter();
  @Output() atualizarFormularioAnalise = new EventEmitter();
  @Output() desbloquearEtpAnalise = new EventEmitter();

  @Output() submissionLoad = new EventEmitter<any>();
  @ViewChild('json') jsonElementRender?: ElementRef;
  public formRenderAnalise: FormioForm = { components: [] };
  public nomeArquivoAnalise: string = '';
  usarSigilo: boolean = false;
  menuIndex = 0;
  clickRetornar: boolean = false;

  private formInstanceAnalise!: any;

  private dadosOriginalAnalise!: any;
  private dadosAlteradosAnalise!: any;

  public options: any = optionsPtBr;

  documentoFormAnalise: any;
  linkCustomFormAnalise: any;
  textolinkCustomFormAnalise: any;

  previousValuesAnalise: Record<string, any> = {};

  pageAnalise: Page<any> = new Page<any>();

  public INSTANCE_FORMIO_ANALISE = 'ETP';
  haslockEtpPermissionAnalise = false;
  hasEtpConsultaPermissionAnalise = false;

  formulariosAnalise: any[] = [];
  etpTipoLicitacaoListAnalise: any[] = [];
  situacaoListAnalise: any[] = [];
  etapaListAnalise: any[] = [];
  etpEditarAnalise: any;
  unidadeList: any[] = [];
  unidadeUsarioLogado!: any;
  tipoPermissaoDelegacao: string = '';
  etpDelegadoAnalise = false;
  etp: any;
  dados: any;
  dadosEtp: any;
  dadosEtpCompleto: any;

  tipoContratacaoAnalise: string = '';
  descricao: string = '';
  processoSeiAnalise: string = '';
  numeroEtp: string = '';
  etpNumeracaoTermoOrientacao: string = '';
  descricaoSituacao: string = '';
  tipoRelatorioEtpAnalise:
    | 'ETP'
    | 'ETP_ANALISE'
    | 'FORMULARIO_COMPLETO'
    | 'FORMULARIO' = 'ETP';

  parametrosAnalise = {
    MSG_SALVAR_DADOS_ANALISE: 'Deseja salvar as informações ?',
    MSG_SAIR_CONTRUROR_ANALISE: 'Deseja sair ?',
    MSG_ATUALIZAR_FORMULARIO_ANALISE:
      'Foi identificado que existe uma versão mais recente publicada do formulário atual!,' +
      ' desja atualizar para a versão mais recente ?',
  };

  mensagensAnalise = {
    MSG_ALTERADO_SUCESSO_ANALISE: 'Alterado com sucesso',
    MSG_SALVO_SUCESSO_ANALISE: 'Salvo com sucesso',
  };

  itemMenuAnalise: boolean[] = [];
  itemsAnalise: MenuItem[] | undefined;
  etapaEtp: any;

  constructor(
    private etpEnvioSeiService: EtpEnvioSeiService,
    private authLoginGuard: AuthLoginGuard,
    public modalServiceAnalise: NgbModal,
    public alertUtils: AlertUtils,
    private gestaoFormularioServiceAnalise: GestaoFormularioService,
    private gestaoEtpServiceAnalise: GestaoEtpAnaliseService,
    private fichaAnaliseService: FichaAnaliseService,
    private fichaAnaliseAnalistasService: FichaAnaliseAnalistasService
  ) {
    const requireLibrary = Formio.requireLibrary;
    // Formio.requireLibrary = function (
    //   nameAnalise,
    //   propertyAnalise,
    //   srcAnalise,
    //   pollingAnalise
    // ) {
    //   // return requireLibrary(
    //   //   nameAnalise,
    //   //   propertyAnalise,
    //   //   srcAnalise.replace(
    //   //     'https://cdn.form.io/ckeditor/19.0.0/ckeditor.js',
    //   //     `${getEnvironment().pathFormularioWeb}/assets/ckeditor.js`
    //   //   ),
    //   //   pollingAnalise
    //   // );
    // };

    window.removeEventListener('open-sei-dialog', () => {});
    window.removeEventListener('link-custom-dialog', () => {});

    window.addEventListener('open-sei-dialog', () => {
      this.openRegistrarAnalise();
    });

    window.addEventListener('link-custom-dialog', () => {
      this.openLinkCustom();
    });
  }

  ngOnInit(): void {
    this.updateMenuAnalise();
    this.registraTemplatesCustomizadosAnalise();

    this.haslockEtpPermissionAnalise = this.authLoginGuard.hasPermission([
      'BLOQUEIO_ETP;F',
    ]);
    if (!this.haslockEtpPermissionAnalise) {
      this.haslockEtpPermissionAnalise = this.authLoginGuard.hasPermission([
        'BLOQUEIO_ETP;R',
      ]);
    }

    this.hasEtpConsultaPermissionAnalise = this.authLoginGuard.hasPermission([
      'ETP_CONSULTA;F',
    ]);

    if (!this.hasEtpConsultaPermissionAnalise) {
      this.hasEtpConsultaPermissionAnalise = this.authLoginGuard.hasPermission([
        'ETP_CONSULTA;R',
      ]);
    }
  }

  ngOnDestroy(): void {
    if (this.formInstanceAnalise) {
      this.formInstanceAnalise.events.off(); // Clean up listeners
      this.formInstanceAnalise.off('change');
      this.formInstanceAnalise.off('render');
      this.formInstanceAnalise.off('submit');
      this.formInstanceAnalise.off('prevPage');
      this.formInstanceAnalise.off('nextPage');
      this.formInstanceAnalise.destroy(true); // Destrói todos os event listeners e libera memória
    }
  }

  gravarEtpAnalise(objEtpAnalise: any) {
    const idAnalise = objEtpAnalise?.id;
    const objAnalise = {
      formulario: Number(objEtpAnalise?.formulario?.id),
      tipoLicitacao: Number(objEtpAnalise?.tipoLicitacao?.id),
      situacao: objEtpAnalise?.situacao?.id,
      descricao: objEtpAnalise?.descricao,
      etpPai: objEtpAnalise?.etpPai,
      versao: objEtpAnalise?.versao,
      ano: objEtpAnalise?.ano ? Number(objEtpAnalise?.ano) : null,
      etpNumeracao: objEtpAnalise?.etpNumeracao,
      etapa: objEtpAnalise?.etapa ? Number(objEtpAnalise?.etapa) : null,
      processoSei: objEtpAnalise?.processoSei,
      unidadeId: objEtpAnalise?.unidadeId,
    };
    if (idAnalise === undefined) {
      this.gestaoEtpServiceAnalise.postEtpAnalise(objAnalise).subscribe({
        next: (etp: any) => {
          this.alertUtils.handleSucess(
            this.mensagensAnalise.MSG_SALVO_SUCESSO_ANALISE
          );
          this.reloadFormularioEtpComCadastrarEtp();
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoEtpServiceAnalise
        .putEtpAnalise(idAnalise, objEtpAnalise)
        .subscribe({
          next: (etp: any) => {
            this.reloadFormularioEtpComCadastrarEtp();
            this.alertUtils.handleSucess(
              this.mensagensAnalise.MSG_ALTERADO_SUCESSO_ANALISE
            );
            this.navegarEtpAnalise(etp);
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
    }
  }

  reloadFormularioEtpComCadastrarEtp() {
    if (this.modalRefAnalise) {
      this.formRenderAnalise = { components: [] };
      this.initObjectFormAnalise();
      this.CADASTRAR_ETP_ANALISE.close(true);
      this.modalRefAnalise.close();
      this.fecharModalFormularioEtpAnalise.emit();
    }
  }

  reloadPublicarEtpAnalise() {
    this.publicarEtpAnalise(this.etpEditarAnalise, 'MINUTA');
  }

  publicarEtpAnalise(obj: any, acao: any) {
    const idAnalise = obj?.id;
    const objFormularioAnalise = Object.values(AcoesEnum).find(
      (value) => value === acao
    );
    this.gestaoEtpServiceAnalise
      .patchEtpAnalise(idAnalise, objFormularioAnalise)
      .subscribe({
        next: (etp: any) => {
          this.alertUtils.handleSucess(
            `Ação ` +
              objFormularioAnalise?.toLowerCase() +
              ` realizada com sucesso`
          );
          this.reloadFormularioEtpAnalise();
          this.navegarEtpAnalise(etp);
          this.alertUtils.handleSucess(
            this.mensagensAnalise.MSG_ALTERADO_SUCESSO_ANALISE
          );
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  executaVersionar(etp: any) {
    this.gestaoEtpServiceAnalise
      .versionarEtpAnalise(etp.id, etp.motivo)
      .subscribe({
        next: (etp: any) => {
          this.alertUtils.handleSucess(`Versão gerada com sucesso`);
          this.reloadFormularioEtpAnalise();
          this.navegarEtpAnalise(etp);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  navegarEtpAnalise(etp: any) {
    this.elaborarEtpAnalise(etp);
  }

  elaborarEtpAnalise(itemEtpAnalise: any, visualizarEtp: boolean = false) {
    if (
      itemEtpAnalise.situacao?.chave === 'PUBLICADO' ||
      itemEtpAnalise.situacao?.chave === 'FECHADO'
    ) {
      visualizarEtp = true;
    }
    itemEtpAnalise.unidadeUsarioLogado = this.unidadeUsarioLogado;
    const objConstrutorFormulario = {
      id: itemEtpAnalise?.id,
      versao: itemEtpAnalise?.versao,
      idFormulario: itemEtpAnalise?.formulario?.id,
      jsonForm: itemEtpAnalise?.formulario?.jsonForm,
      jsonDados: itemEtpAnalise?.jsonDados,
      tipoContratacaoAnalise: itemEtpAnalise?.tipoLicitacao?.descricao,
      tipoContratacaoAnaliseId: itemEtpAnalise?.tipoLicitacao?.id,
      tipoContratacaoAnaliseChave: itemEtpAnalise?.tipoLicitacao?.chave,
      descricao: itemEtpAnalise?.descricao,
      processoSei:
        itemEtpAnalise.numeroprocessoSei !== null
          ? itemEtpAnalise.numeroprocessoSei +
            '/' +
            itemEtpAnalise.anoprocessoSei
          : '',
      numeroEtp:
        itemEtpAnalise.etpNumeracao !== null
          ? itemEtpAnalise.etpNumeracao + '/' + itemEtpAnalise.ano
          : '',
      visualizar: visualizarEtp,
      situacao: itemEtpAnalise.situacao,
    };

    this.open({
      etp: objConstrutorFormulario,
      item: itemEtpAnalise,
      formularioList: this.formulariosAnalise,
      tipoLicitacaoList: this.etpTipoLicitacaoListAnalise,
      situacaoList: this.situacaoListAnalise,
      etapaList: this.etapaListAnalise,
      unidadeList: this.unidadeList,
    });
  }

  public open(openEtpAnalise: OpenEtp): Promise<boolean> {
    this.etpEditarAnalise = {
      unidadeId: openEtpAnalise.etp.unidadeId,
      ...openEtpAnalise.item,
      propriedade: 'Propriedades',
    };

    this.etpDelegadoAnalise = openEtpAnalise.etpDelegado || false;
    getEnvironment().etpPartesId = this.etpEditarAnalise?.formulario?.id;
    this.etapaEtp = openEtpAnalise.item.etpEtapa;
    this.formulariosAnalise = openEtpAnalise.formularioList;
    this.etpTipoLicitacaoListAnalise = openEtpAnalise.tipoLicitacaoList;
    this.situacaoListAnalise = openEtpAnalise.situacaoList;
    this.etapaListAnalise = openEtpAnalise.etapaList;
    this.unidadeList = openEtpAnalise.unidadeList;
    this.unidadeUsarioLogado = openEtpAnalise.item.unidadeUsarioLogado;
    this.tipoPermissaoDelegacao = openEtpAnalise.item.tipoPermissaoDelegacao;
    this.clickRetornar = false;
    this.initObjectFormAnalise();
    this.setDadosFormulario(openEtpAnalise.etp);
    this.dadosEtp = openEtpAnalise.etp;
    this.dadosEtpCompleto = openEtpAnalise;
    this.nomeArquivoAnalise =
      'ETP_' +
      this.dadosEtp.descricao +
      (this.dadosEtp.numeroEtp
        ? '_' + this.dadosEtp.numeroEtp.replace('/', '_')
        : '') +
      (this.dadosEtp.processoSei
        ? '_' + this.dadosEtp.processoSei.replace('/', '_')
        : '') +
      '_' +
      'versão_' +
      this.dadosEtp.versao;
    this.opsVisualizarMenuLateral(openEtpAnalise.etp);

    return new Promise<boolean>((resolve) => {
      this.modalRefAnalise = this.modalServiceAnalise.open(
        this.modalContentAnalise,
        {
          centered: true,
          fullscreen: true,
          backdrop: 'static',
          keyboard: false,
          size: 'xl',
        }
      );
      this.menuIndex = 0;
      this.modalRefAnalise.result.then((result) => {
        resolve(result);
      });
    });
  }

  estaAbertoAnalise() {
    return (
      this.etpEditarAnalise?.situacao?.chave === 'ABERTO' &&
      this.hasEtpConsultaPermissionAnalise === false &&
      this.tipoPermissaoDelegacao !== 'CONSULTA' &&
      this.etpEditarAnalise.etpEtapa.chave !== 'EM_ANALISE'
    );
  }

  opsVisualizarMenuLateral(etp: any) {
    // Elaboração:0 | Ficha de Análise:1 | Relatório:2 | Termo de Orientação:3 | Propriedades:4 | Envio Sei:5
    // Comparar Versões:6 | Histórico:7 | Sair:8 | Fechar Análise:9 | Enviar para Revisão:10

    this.desabilitaTudoAnalise();

    if (this.etpEditarAnalise.etpEtapa?.chave === 'AGUARDANDO_ANALISE') {
      this.habilitaAnalise([0, 1, 3, 2, 4, 6, 7, 8, 10]);
    }

    if (this.etpEditarAnalise.etpEtapa?.chave === 'AGUARDANDO_REVISAO') {
      this.habilitaAnalise([0, 1, 3, 2, 4, 6, 7, 8, 9]);
    }

    if (
      this.etpEditarAnalise.etpEtapa?.chave === 'AGUARDANDO_RETORNO_ANALISE'
    ) {
      this.habilitaAnalise([0, 1, 3, 2, 4, 5, 6, 7, 8]);
    }

    if (this.etpEditarAnalise.etpEtapa?.chave === 'ANALISADO') {
      this.habilitaAnalise([0, 1, 2, 3, 4, 6, 7, 8]);
    }
  }

  async salvarFoiAlterado() {
    if (this.compararAlteracoesJsonDados()) {
      const msgsalvar = 'Deseja salvar o que já foi alterado?';
      await this.alertUtils.confirmDialog(msgsalvar).then((dataConfirme) => {
        if (dataConfirme) {
          this.submit(JSON.stringify(this.formInstanceAnalise.submission.data));
        }
      });
    }
  }

  async vaiUsarSigilo() {
    const msgsalvar = 'Deseja usar sigilo no relatório?';
    await this.alertUtils.confirmDialog(msgsalvar).then((dataConfirme) => {
      this.usarSigilo = dataConfirme;
    });
  }

  validaFormulario(): any {
    return this.formInstanceAnalise.checkValidity(
      this.formInstanceAnalise.submission.data,
      true
    );
  }

  async close() {
    if (!this.clickRetornar) {
      this.clickRetornar = true;
      if (this.compararAlteracoesJsonDados()) {
        const msgsalvar = 'Deseja salvar o que já foi alterado?';
        await this.alertUtils.confirmDialog(msgsalvar).then((dataConfirme) => {
          if (dataConfirme) {
            this.submit(
              JSON.stringify(this.formInstanceAnalise.submission.data)
            );
            this.ngOnDestroy();
            this.reloadFormularioEtpAnalise();
          } else {
            this.clickRetornar = false;
            this.ngOnDestroy();
            this.reloadFormularioEtpAnalise();
          }
        });
      } else {
        let msg = this.parametrosAnalise.MSG_SAIR_CONTRUROR_ANALISE;
        this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
          if (dataConfirme) {
            this.ngOnDestroy();
            this.reloadFormularioEtpAnalise();
          } else {
            this.clickRetornar = false;
          }
        });
      }
    }
  }

  salvarRelatorio() {
    this.menuIndex = 1;
  }

  salvarRelatorioAnalise() {
    this.menuIndex = 15;
  }

  compararAlteracoesJsonDados(): boolean {
    let retorno = false;

    if (
      JSON.stringify(this.dadosOriginalAnalise) !==
      JSON.stringify(this.dadosAlteradosAnalise)
    ) {
      retorno = true;
    }

    return retorno;
  }

  reloadFormularioEtpAnalise() {
    if (this.modalRefAnalise) {
      this.formRenderAnalise = { components: [] };
      this.initObjectFormAnalise();
      this.fecharModalFormularioEtpAnalise.emit();
      this.modalRefAnalise.close();
      this.desbloquearEtpAnalise.emit({
        id: this.etpEditarAnalise?.id,
        bloqueado: false,
      });
    }
  }

  initObjectFormAnalise() {
    this.etp = {
      jsonForm: '',
      jsonDados: '',
      jsonDadosTemp: '',
      id: '',
      idFormulario: '',
      jsondadosOriginalAnalise: '',
    };
  }

  private setDadosFormulario(etp: any) {
    this.etp.jsonForm = etp.jsonForm;
    this.etp.id = etp.id;
    this.formRenderAnalise = JSON.parse(this.etp.jsonForm);

    if (etp.jsonDados) {
      this.etp.jsonDados = etp.jsonDados;
      this.etp.jsondadosOriginalAnalise = etp.jsonDados;
      this.etp.jsonDadosTemp = etp.jsonDados;
      this.etp.jsonDadosAnteriores = etp.jsonDados;
    } else {
      this.etp.jsonDados = '';
      this.etp.jsondadosOriginalAnalise = '';
      this.etp.jsonDadosAnteriores = '';
      this.etp.jsonDadosTemp = '';
    }
    this.tipoContratacaoAnalise = etp.tipoContratacao;
    this.descricao = etp?.descricao;
    this.processoSeiAnalise = etp.processoSei;
    this.numeroEtp = etp.numeroEtp;
    this.etpNumeracaoTermoOrientacao = etp.etpNumeracaoTermoOrientacao
      ? etp.etpNumeracaoTermoOrientacao
      : '';
    this.descricaoSituacao = etp?.situacao?.descricao;
  }

  public cancelarNovaVersaoAnalise(etpAnalise: any) {
    this.etp.jsonForm = etpAnalise.jsonForm;
    this.etp.id = etpAnalise.id;
    this.formRenderAnalise = JSON.parse(this.etp.jsonForm);
  }

  public aceitarNovaVersaoAnalise(etpAnalise: any, formulario: any) {
    const etpAceitarNovaVersaoFormularioAnalise = {
      ...etpAnalise,
      motivo: 'Versionado pelo usuário devido nova versão do modelo.',
    };
    this.executaVersionar(etpAceitarNovaVersaoFormularioAnalise);
  }

  desabilitarComponentsAnalise(formularioAnalise: any) {
    let componentAnalise = FormioUtils.getComponent(
      formularioAnalise.components,
      'PAR_TIPO_CONTRATACAO_PAR',
      true
    );
    if (componentAnalise) componentAnalise.disabled = true;

    componentAnalise = FormioUtils.getComponent(
      formularioAnalise.components,
      'PAR_PROCESSO_SEI_PAR',
      true
    );
    if (componentAnalise) componentAnalise.disabled = true;

    componentAnalise = FormioUtils.getComponent(
      formularioAnalise.components,
      'PAR_NUMERO_ETP_PAR',
      true
    );
    if (componentAnalise) componentAnalise.disabled = true;
  }

  private injectRender(elementoAnalise: HTMLElement) {
    if (this.INSTANCE_FORMIO_ANALISE !== 'ETP') return;

    if (this.formInstanceAnalise) {
      this.ngOnDestroy();
    }

    const formularioAnalise = JSON.parse(
      JSON.stringify(this.formRenderAnalise, null, 4)
    );
    this.desabilitarComponentsAnalise(formularioAnalise);
    this.setaClearOnHideAnalise(formularioAnalise);
    this.registraTemplatesCustomizadosAnalise();
    const optionsFormularioAnalise = { ...this.options };

    this.setaReadOnly(formularioAnalise);

    optionsFormularioAnalise.somenteLeitura = true;
    if (
      this.etpEditarAnalise.etpEtapa.chave === 'AGUARDANDO_ANALISE' ||
      this.etpEditarAnalise.etpEtapa.chave === 'AGUARDANDO_REVISAO'
    ) {
      optionsFormularioAnalise.somenteLeitura = false;
    }

    Formio.createForm(
      elementoAnalise,
      formularioAnalise,
      optionsFormularioAnalise
    )
      .then((instance: any) => {
        this.formInstanceAnalise = instance;

        this.configurarEventosAnalise(instance);
        this.setarDadosIniciais(instance);

        this.setarPropriedadesAnalise();
        this.setarSubmissionAnalise(instance);
      })
      .catch((error) => this.mensagemErroAnalise(error));
  }

  private configurarEventosAnalise(instanceAnalise: any) {
    instanceAnalise.on('change', (event: any) => {
      try {
        setTimeout(() => {
          if (event.changed?.component) {
            this.dadosAlteradosAnalise = _.cloneDeep(event.data);
          }
        }, 0);
      } catch (error) {
        this.mensagemErroAnalise(error);
      }
    });

    instanceAnalise.once('render', () => this.onFirstRender(instanceAnalise));
    instanceAnalise.on('render', () => this.onRender(instanceAnalise));
    instanceAnalise.on('submit', () => this.onSubmit(instanceAnalise));
    instanceAnalise.on('prevPage', (event: any) =>
      this.safeCallback(() => this.onNext())
    );
    instanceAnalise.on('nextPage', (event: any) =>
      this.safeCallback(() => this.onNext())
    );
  }

  private onFirstRender(instanceAnalise: any) {
    try {
      this.formInstanceAnalise = instanceAnalise;
      setTimeout(() => {
        this.validaPreenchimentoAnalise(
          instanceAnalise,
          instanceAnalise.submission.data,
          true
        );
      }, 100);

      this.dadosOriginalAnalise = _.cloneDeep(instanceAnalise.submission.data);
      this.dadosAlteradosAnalise = _.cloneDeep(instanceAnalise.submission.data);
    } catch (error) {
      this.mensagemErroAnalise(error);
    }
  }

  private onRender(instance: any) {
    try {
      this.setupBotao('btnValidaFormulario', () => {
        setTimeout(() => {
          this.validaPreenchimentoAnalise(
            instance,
            instance.submission.data,
            true
          );
          this.submit(JSON.stringify(instance.submission.data));
        }, 0);
      });

      this.setupBotao('btnFechaFormulario', () => this.close());
    } catch (error) {
      this.mensagemErroAnalise(error);
    }
  }

  private onSubmit(instanceAnalise: any) {
    try {
      this.submit(JSON.stringify(instanceAnalise.submission.data));
    } catch (errorAnalise) {
      this.mensagemErroAnalise(errorAnalise);
    }
  }

  private setupBotao(idAnalise: string, callbackAnalise: () => void) {
    let btn = document.getElementById(idAnalise);
    if (!btn) return;

    btn.replaceWith(btn.cloneNode(true));
    const newBtn = document.getElementById(idAnalise);
    newBtn?.addEventListener('click', callbackAnalise);
  }

  private safeCallback(fn: () => void) {
    try {
      fn();
    } catch (error) {
      this.mensagemErroAnalise(error);
    }
  }

  private setarDadosIniciais(instance: any) {
    if (this.etp.jsonDados) {
      const submissionData = {
        data: JSON.parse(this.etp.jsonDados),
      };

      setTimeout(() => {
        instance.setSubmission(submissionData, {
          fromSubmission: false,
        });
        instance.triggerRedraw();
      }, 0);
    }
  }

  mensagemErroAnalise(error: any) {
    const erroAnalise = error as Error;
    this.alertUtils.alertDialog(
      'Erro ao carregar Formio: ' + JSON.stringify(erroAnalise.stack)
    );
  }

  setarPropriedadesAnalise() {
    try {
      const jsonObjectAnalise: Record<string, any> =
        this.etp.jsonDados.length >= 10 ? JSON.parse(this.etp.jsonDados) : {};
      jsonObjectAnalise['PAR_PROCESSO_SEI_PAR'] = this.dadosEtp.processoSei;
      jsonObjectAnalise['PAR_NUMERO_ETP_PAR'] = this.dadosEtp.numeroEtp;
      jsonObjectAnalise['PAR_TIPO_CONTRATACAO_PAR'] =
        this.dadosEtp.tipoContratacaoChave;
      this.etp.jsonDados = JSON.stringify(jsonObjectAnalise);
      this.etp.jsonDadosTemp = jsonObjectAnalise;
    } catch (error) {
      console.log(error);
    }
  }

  private setarSubmissionAnalise(instance: any) {
    try {
      const submissionDataAnalise = {
        data: JSON.parse(this.etp.jsonDados),
      };

      setTimeout(() => {
        instance.setSubmission(submissionDataAnalise, {
          fromSubmission: false,
        });
        instance.triggerRedraw();
      }, 0);
    } catch (error) {
      this.mensagemErroAnalise(error);
    }
  }

  public onNext() {
    let dadosAnalise = JSON.stringify(this.etp.jsonDadosTemp);
    this.etp.jsonDados = dadosAnalise;
  }

  public submit(dadosAnalise: any) {
    const dadosInformadosAnalise = {
      id: this.etp?.id,
      jsonDados: dadosAnalise,
    };
    this.etp.jsonDados = dadosAnalise;

    setTimeout(() => {
      this.gravarDadosFormularioEtpNext(dadosInformadosAnalise);
    }, 0);
  }

  renderFormio(): void {
    let elementoAnalise = document.getElementById('formulario');
    if (elementoAnalise) {
      this.injectRender(elementoAnalise);
    }
  }

  toggleFullScreen(elementAnalise: any) {
    if (!document.fullscreenElement) {
      // Tenta colocar o elemento específico em tela cheia
      if (elementAnalise.requestFullscreen) {
        elementAnalise.requestFullscreen();
      }
    } else {
      // Sai do modo de tela cheia se já estiver em tela cheia
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  openFullScreen(nameElementAnalise: string) {
    let meuDivAnalise = document.getElementById(nameElementAnalise);
    this.toggleFullScreen(meuDivAnalise);
  }

  updateMenuAnalise() {
    this.itemsAnalise = [
      {
        label: 'Análise',
        icon: 'fa fa-fw fa-building',
        command: () => (this.menuIndex = 0),
        disabled: this.itemMenuAnalise[0],
      },
      {
        icon: 'fa fa-fw fa-file-pen',
        label: 'Ficha de Análise',
        command: () => {
          this.abrirFichaAnalise();
        },
        disabled: this.itemMenuAnalise[1],
      },

      {
        icon: 'fa fa-fw fa-file-pdf',
        label: 'Termo de Orientação',
        command: async () => {
          await this.salvarFoiAlterado();
          const value = this.formInstanceAnalise.data['PAR_PARTES_ETP_PAR'];
          if (value && value.length > 0) {
            await this.vaiUsarSigilo();
          }
          this.tipoRelatorioEtpAnalise = 'ETP_ANALISE';
          this.salvarRelatorioAnalise();
        },
        disabled: this.itemMenuAnalise[3],
      },

      {
        icon: 'fa fa-fw fa-file-pdf',
        label: 'Relatório',
        command: async () => {
          await this.salvarFoiAlterado();
          const value = this.formInstanceAnalise.data['PAR_PARTES_ETP_PAR'];
          if (value && value.length > 0) {
            await this.vaiUsarSigilo();
          }
          this.tipoRelatorioEtpAnalise = 'ETP';
          this.salvarRelatorio();
        },
        disabled: this.itemMenuAnalise[2],
      },

      {
        icon: 'fa fa-fw fa-file-pen',
        label: 'Propriedades',
        command: async () => {
          await this.salvarFoiAlterado();
          this.CADASTRAR_ETP_ANALISE.open(
            this.etpEditarAnalise,
            this.formulariosAnalise,
            this.etpTipoLicitacaoListAnalise,
            this.situacaoListAnalise,
            this.etapaListAnalise,
            this.unidadeList,
            this.unidadeUsarioLogado
          );
        },
        disabled: this.itemMenuAnalise[4],
      },

      {
        label: 'Ações',
        icon: 'fa fa-fw fa-cog',
        items: [
          {
            icon: 'fa fa-fw fa-lock',
            label: 'Fechar Análise',
            command: async () => {
              const podeFechar = this.validaFormulario();
              if (!podeFechar) {
                this.alertUtils.toastrWarningMsg(
                  'A análise tem campo obrigatório não preenchido, favor concluir a análise antes de Fechar a Análise!!'
                );
                return;
              }
              await this.salvarFoiAlterado();
              this.trocarEtapaEtp(
                this.etpEditarAnalise,
                'AGUARDANDO_RETORNO_ANALISE'
              );
            },
            disabled: this.itemMenuAnalise[9],
          },

          {
            icon: 'fa fa-fw fa-lock',
            label: 'Enviar para Revisão',
            command: async () => {
              const podeFechar = this.validaFormulario();
              if (!podeFechar) {
                this.alertUtils.toastrWarningMsg(
                  'A análise tem campo obrigatório não preenchido, favor concluir a análise antes de Enviar para Revisão!!'
                );
                return;
              }
              await this.salvarFoiAlterado();
              this.trocarEtapaEtp(this.etpEditarAnalise, 'AGUARDANDO_REVISAO');
            },
            disabled: this.itemMenuAnalise[10],
          },
        ],
      },

      {
        icon: 'fa fa-fw fa-paper-plane',
        label: 'Envio SEI/Retorno',
        command: () => this.ENVIAR_SEI_ANALISE.open(),
        disabled: this.itemMenuAnalise[5],
      },
      {
        icon: 'fa fa-fw fa-code-compare',
        label: 'Comparar Versões',
        command: () => (this.menuIndex = 8),
        disabled: this.itemMenuAnalise[6],
      },
      {
        icon: 'fa fa-solid fa-history',
        label: 'Histórico',
        command: () => {
          this.gestaoEtpServiceAnalise
            .getLogsEtpAnalise(this.etp.id)
            .subscribe((response) => {
              if (response) {
                this.LOGS_ETP_ANALISE.open(response);
              }
            });
        },
        disabled: this.itemMenuAnalise[7],
      },
      {
        icon: 'fa fa-fw  fa-sign-out',
        label: 'Sair',
        command: () => {
          this.close();
        },
        disabled: this.itemMenuAnalise[8],
      },
    ];
  }

  trocarEtapaEtp(obj: any, acao: any) {
    const id = obj?.id;
    const objFormulario = Object.keys(EtapasEnum).find((key) => key === acao);
    const textoEtapa = EtapasEnum[acao as keyof typeof EtapasEnum];
    let msg = `
    Deseja ${textoEtapa} ?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpServiceAnalise
          .alteraEtpEtapaAnalise(id, objFormulario)
          .subscribe({
            next: (etp: any) => {
              this.alertUtils.handleSucess(
                `Ação ` + textoEtapa + ` enviada com sucesso`
              );
              this.reloadFormularioEtpAnalise();
            },
            error: (e: any) => {
              this.alertUtils.toastrErrorMsg(e);
            },
          });
      }
    });
  }

  desabilitaTudoAnalise() {
    for (let j = 0; j <= 13; j++) {
      this.itemMenuAnalise[j] = true;
    }
  }

  habilitaAnalise(indexAnalise: number[]) {
    indexAnalise.forEach((i) => {
      this.itemMenuAnalise[i] = false;
    });

    this.updateMenuAnalise();
  }

  desabilitarAnalise(indexAnalise: number[]) {
    indexAnalise.forEach((i) => {
      this.itemMenuAnalise[i] = true;
    });

    this.updateMenuAnalise();
  }

  public openRegistrarAnalise(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalRefRegistrarAnalise = this.modalServiceAnalise.open(
        this.modalContentAnaliseRegistrar,
        {
          centered: true,
          backdrop: 'static', // Não fechar ao clicar fora
          keyboard: false,
          fullscreen: false,
          windowClass: 'modal-largura-customizada-registrar',
        }
      );
      this.modalRefRegistrarAnalise.result.then((result) => {
        resolve(result);
      });
    });
  }

  public openLinkCustom(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalRefLinkCustomAnalise = this.modalServiceAnalise.open(
        this.modalLinkCustom,
        {
          centered: true,
          backdrop: 'static', // Não fechar ao clicar fora
          keyboard: false,
          fullscreen: false,
          windowClass: 'modal-largura-customizada-registrar',
        }
      );
      this.modalRefLinkCustomAnalise.result.then((result) => {
        resolve(result);
      });
    });
  }

  registrarEnvioseiEtpForm() {
    const dsdosDocumentoAnalise = {
      procedimento: this.documentoFormAnalise,
    };

    this.etpEnvioSeiService
      .consultarDocumentoSei(dsdosDocumentoAnalise)
      .subscribe({
        next: (documentoRespostaAnalise: any) => {
          if (documentoRespostaAnalise) {
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent('sei-dialog-response', {
                  detail: {
                    link: documentoRespostaAnalise.linkAcesso,
                    text: documentoRespostaAnalise.documentoFormAnaliseatado,
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
          this.closeRegistrarFormAnalise();
        },
      });
  }

  closeRegistrarFormAnalise() {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('sei-dialog-response', {
          detail: { link: null, text: null },
        })
      );
    }, 1000);

    if (this.modalRefRegistrarAnalise) {
      this.modalRefRegistrarAnalise.close();
    }
  }

  registrarlinkCustomFormAnalise() {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('link-custom-dialog-response', {
          detail: {
            link: this.linkCustomFormAnalise,
            text: this.textolinkCustomFormAnalise,
          },
        })
      );
    }, 0);
    this.closeRegistrarLinkCustomAnalise();
  }

  closeRegistrarLinkCustomAnalise() {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('link-custom-dialog-response', {
          detail: { link: null, text: null },
        })
      );
    }, 0);

    if (this.modalRefLinkCustomAnalise) {
      this.modalRefLinkCustomAnalise.close();
    }
  }

  validaPreenchimentoAnalise(
    formularioAnalise: any,
    dados: any,
    primeiraVez: boolean
  ) {
    // valida os campos de input
    FormioUtils.eachComponent(
      formularioAnalise.components,
      (componentAnalise: any) => {
        let isValid = false;
        if (
          componentAnalise.type == 'botaoajuda' ||
          componentAnalise.type == 'textoajuda' ||
          componentAnalise.type == 'notainterna' ||
          componentAnalise.type == 'columns'
        ) {
          isValid = true;
        }

        if (typeof componentAnalise.checkValidity === 'function') {
          try {
            isValid = componentAnalise.checkValidity(dados, false);
            componentAnalise.parent.filled = true;
            componentAnalise.parent.component.filled = true;
            componentAnalise.filled = isValid;
          } catch (error) {
            console.log(error);
          }
        }

        if (
          componentAnalise.components &&
          componentAnalise.components.length > 0
        ) {
          this.validaPreenchimentoAnalise(componentAnalise, dados, primeiraVez);
        }
      },
      true
    );

    this.setaPanel(formularioAnalise);

    if (primeiraVez) {
      formularioAnalise.triggerRedraw();
    }
  }

  setaPanel(formulario: any) {
    FormioUtils.eachComponent(
      formulario.components,
      (component: any) => {
        if (component.filled === false) {
          component.parent.component.filled = false;
          component.parent.filled = false;
        }

        if (component.components && component.components.length > 0) {
          this.setaPanel(component);
        }
      },
      true
    );
  }

  gravarDadosFormularioEtpNext(dadosFormularioEtp: any) {
    const id = dadosFormularioEtp?.id;
    const objFormulario = {
      jsonDados: dadosFormularioEtp?.jsonDados,
    };

    this.gestaoEtpServiceAnalise
      .patchNextEtpAnalise(id, objFormulario)
      .subscribe({
        next: () => {},
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  registraTemplatesCustomizadosAnalise() {
    Templates.current.wizard = this.options.templates.wizard;
    Templates.current.componentModal = this.options.templates.componentModal;
    Templates.current.modalPreview = this.options.templates.modalPreview;
    Templates.current.wizardNav = this.options.templates.wizardNav;
    Templates.current.input = this.options.templates.input;
    Templates.current.panel = this.options.templates.panel;
  }

  setaClearOnHideAnalise(formulariosAnalise: any) {
    FormioUtils.eachComponent(
      formulariosAnalise.components,
      (component: any) => {
        component.clearOnHide = false;
        if (component.components && component.components.length > 0) {
          this.setaClearOnHideAnalise(component);
        }
      },
      true
    );
  }

  setaReadOnly(formulario: any) {
    formulario.somenteLeitura = true;

    FormioUtils.eachComponent(
      formulario.components,
      (component: any) => {
        if (
          this.etpEditarAnalise.etpEtapa.chave == 'ANALISADO' ||
          this.etpEditarAnalise.etpEtapa.chave == 'AGUARDANDO_RETORNO_ANALISE'
        ) {
          component.disabled = true;
        } else if (
          component.isAnalise ||
          (component.key && component.key.startsWith('CAMPO_ANALISE_'))
        ) {
          component.disabled = false;
        } else {
          component.disabled = true;
        }

        if (component.components && component.components.length > 0) {
          this.setaReadOnly(component);
        }
      },
      false
    );
  }

  removerAnalistaFichaAnalise(event: any) {
    this.fichaAnaliseAnalistasService
      .deleteFichaAnaliseAnalistas(event)
      .subscribe({
        next: () => {
          this.alertUtils.handleSucess(`Analista removido com sucesso`);
          this.FICHA_ANALISE.close();
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  gravarFichaAnalise(event: any) {
    if (event.ficha.id) {
      this.fichaAnaliseService
        .putFichaAnalise(event.ficha.id, event.ficha)
        .subscribe({
          next: () => {
            this.fichaAnaliseAnalistasService
              .putInBLockFichaAnaliseAnalistas(event.ficha.id, event.analistas)
              .subscribe({
                next: () => {
                  this.alertUtils.handleSucess(`Alterado com sucesso`);
                  this.FICHA_ANALISE.close();
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
    } else {
      this.fichaAnaliseService.postFichaAnalise(event.ficha).subscribe({
        next: (data: any) => {
          const analistas = event.analistas;
          analistas.map((a: any) => {
            a.idFichaAnalise = data.id;
          });
          this.fichaAnaliseAnalistasService
            .postInBLockFichaAnaliseAnalistas(analistas)
            .subscribe({
              next: () => {
                this.alertUtils.handleSucess(`Salvo com sucesso`);
                this.FICHA_ANALISE.close();
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
  }

  private abrirFichaAnalise() {
    this.fichaAnaliseService.getFichaAnalisePorEtp(this.dadosEtp.id).subscribe({
      next: (fichaAnalise: any) => {
        if (fichaAnalise) {
          this.fichaAnaliseAnalistasService
            .getAnalistasFichaAnalise(fichaAnalise.id)
            .subscribe({
              next: (analistas: any) => {
                analistas.map((a: any) => {
                  a.idFichaAnalise = fichaAnalise.id;
                });

                this.FICHA_ANALISE.open(
                  this.etapaListAnalise,
                  this.situacaoListAnalise,
                  this.unidadeList,
                  this.dadosEtp,
                  fichaAnalise,
                  analistas
                );
              },
              error: (e: any) => {
                this.alertUtils.toastrErrorMsg(e);
              },
            });
        } else {
          this.FICHA_ANALISE.open(
            this.etapaListAnalise,
            this.situacaoListAnalise,
            this.unidadeList,
            this.dadosEtp,
            null,
            []
          );
        }
      },
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }
}
