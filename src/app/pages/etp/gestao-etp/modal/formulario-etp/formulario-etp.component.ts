import { Page } from '@administrativo/components';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  Components,
  Formio,
  FormioForm,
  FormioUtils,
  Templates,
} from '@formio/angular';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { document } from 'ngx-bootstrap/utils';
import { MenuItem } from 'primeng/api';
import { getEnvironment } from 'src/app/app.component';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';
import PartesEtpSelect from 'src/app/pages/formulario/componentes-customizados-formio/partes-etp-select';
import { EtpEnvioSeiService } from 'src/app/services/etp-envio-sei.service';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';
import { AcoesEnum } from 'src/app/shared/models/acoes.enum';
import { AlertUtils } from '../../../../../../utils/alerts.util';
import { GestaoFormularioService } from '../../../../../services/gestao-formulario.service';
import { DelegarAcessoComponent } from '../../../../delegacao-acesso/gestao-delegacao-acesso/delegar-acesso.component';
import ServidorSelect from '../../../../formulario/componentes-customizados-formio/servidores-select';
import TipoContratacaoSelect from '../../../../formulario/componentes-customizados-formio/tipocontratacao-select';
import UnidadeSelect from '../../../../formulario/componentes-customizados-formio/unidades-select';
import { optionsPtBr } from '../../../../formulario/modal/modal-construir-formulario/options/options';
import { CadastrarEtpComponent } from '../cadastrar-etp/cadastrar-etp.component';
import { CompararHtmlEtpNovaVersaoComponent } from '../comparar-html-etp-nova-versao/comparar-html-etp-nova-versao.component';
import { EnvioSeiComponent } from '../envio-sei/envio-sei.component';
import { ListarLogsEtpComponent } from '../listar-logs-etp/listar-logs-etp.component';
import { VersionarComponent } from '../versionar/versionar.component';
import { VersoesEtpComponent } from '../versoes-etp/versoes-etp.component';

const editForm = Components.components.select.editForm;
UnidadeSelect.editForm = editForm;
Components.setComponent('unidadeselect', UnidadeSelect);
PartesEtpSelect.editForm = editForm;
Components.setComponent('partesetpselect', PartesEtpSelect);
ServidorSelect.editForm = editForm;
Components.setComponent('servidorselect', ServidorSelect);
TipoContratacaoSelect.editForm = editForm;
Components.setComponent('tipocontratacaoselect', TipoContratacaoSelect);

export interface OpenEtp {
  etp: any;
  item: any;
  formularioList: any[];
  tipoLicitacaoList: any[];
  situacaoList: any[];
  etapaList: any[];
  unidadeList: any[];
  etpDelegado?: boolean;
}

@Component({
  selector: 'formulario-etp',
  templateUrl: './formulario-etp.component.html',
  styleUrl: './formulario-etp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioEtpComponent implements OnInit, OnDestroy {
  @ViewChild('registrarSeiModalForm') private modalContentRegistrar:
    | TemplateRef<EnvioSeiComponent>
    | undefined;
  modalRefRegistrar!: NgbModalRef;

  @ViewChild('registrarLinkCustomModalForm') private modalLinkCustom:
    | TemplateRef<EnvioSeiComponent>
    | undefined;
  modalRefLinkCustom!: NgbModalRef;

  @ViewChild('formularioEtpComponent', { static: true }) private modalContent:
    | TemplateRef<FormularioEtpComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @ViewChild('cadastrar_etp', { static: true })
  CADASTRAR_ETP!: CadastrarEtpComponent;

  @ViewChild('versionar_etp', { static: true })
  VERSIONAR_ETP!: VersionarComponent;

  @ViewChild('versoes_etp', { static: true })
  VERSOES_ETP!: VersoesEtpComponent;

  @ViewChild('logsEtp', { static: true })
  LOGS_ETP!: ListarLogsEtpComponent;

  @ViewChild('enviar_sei', { static: true })
  ENVIAR_SEI!: EnvioSeiComponent;

  @ViewChild('htmlNovaVersao', { static: true })
  COMPARAR_FORMULARIO_HTML!: CompararHtmlEtpNovaVersaoComponent;
  @ViewChild('delegar_acesso', { static: true })
  DELEGAR_ACESSO!: DelegarAcessoComponent;

  @Output() gravarDadosInformados = new EventEmitter();
  @Output() fecharModalFormularioEtp = new EventEmitter();
  @Output() refreshForm = new EventEmitter();
  @Output() atualizarFormulario = new EventEmitter();
  @Output() desbloquearEtp = new EventEmitter();

  @Output() submissionLoad = new EventEmitter<any>();
  @ViewChild('json') jsonElementRender?: ElementRef;
  public formRender: FormioForm = { components: [] };
  public nomeArquivo: string = '';
  usarSigilo: boolean = false;
  menuIndex = 0;
  clickRetornar: boolean = false;

  private formInstance!: any;

  private dadosOriginal!: any;
  private dadosAlterados!: any;

  public options: any = optionsPtBr;

  documentoForm: any;
  linkCustomForm: any;
  textoLinkCustomForm: any;

  previousValues: Record<string, any> = {};

  page: Page<any> = new Page<any>();

  public INSTANCE_FORMIO = 'ETP';
  haslockEtpPermission = false;
  hasEtpConsultaPermission = false;

  formularios: any[] = [];
  etpTipoLicitacaoList: any[] = [];
  situacaoList: any[] = [];
  etapaList: any[] = [];
  etpEditar: any;
  unidadeList: any[] = [];
  unidadeUsarioLogado!: any;
  tipoPermissaoDelegacao: string = '';
  etpDelegado = false;
  etp: any;
  dados: any;
  dadosEtp: any;
  dadosEtpCompleto: any;

  tipoContratacao: string = '';
  descricao: string = '';
  processoSei: string = '';
  numeroEtp: string = '';
  etpNumeracaoTermoOrientacao: string = '';
  descricaoSituacao: string = '';

  pageRender: any = undefined;
  parametros = {
    MSG_SALVAR_DADOS: 'Deseja salvar as informações ?',
    MSG_SAIR_CONTRUROR: 'Deseja sair ?',
    MSG_ATUALIZAR_FORMULARIO:
      'Foi identificado que existe uma versão mais recente publicada do formulário atual!,' +
      ' desja atualizar para a versão mais recente ?',
  };

  mensagens = {
    MSG_ALTERADO_SUCESSO: 'Alterado com sucesso',
    MSG_SALVO_SUCESSO: 'Salvo com sucesso',
  };

  itemMenu: boolean[] = [];
  items: MenuItem[] | undefined;
  etapaEtp: any;

  constructor(
    private etpEnvioSeiService: EtpEnvioSeiService,
    private authLoginGuard: AuthLoginGuard,
    public modalService: NgbModal,
    public alertUtils: AlertUtils,
    private gestaoFormularioService: GestaoFormularioService,
    private gestaoEtpService: GestaoEtpService
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
    //};

    window.removeEventListener('open-sei-dialog', () => {});
    window.removeEventListener('link-custom-dialog', () => {});

    window.addEventListener('open-sei-dialog', () => {
      this.openRegistrar();
    });

    window.addEventListener('link-custom-dialog', (event: any) => {
      const selectedText = event?.detail?.selectedText || '';
      this.openLinkCustom(selectedText);
    });
  }

  ngOnInit(): void {
    this.updateMenu();
    this.registraTemplatesCustomizados();

    this.haslockEtpPermission = this.authLoginGuard.hasPermission([
      'BLOQUEIO_ETP;F',
    ]);
    if (!this.haslockEtpPermission) {
      this.haslockEtpPermission = this.authLoginGuard.hasPermission([
        'BLOQUEIO_ETP;R',
      ]);
    }

    this.hasEtpConsultaPermission = this.authLoginGuard.hasPermission([
      'ETP_CONSULTA;F',
    ]);

    if (!this.hasEtpConsultaPermission) {
      this.hasEtpConsultaPermission = this.authLoginGuard.hasPermission([
        'ETP_CONSULTA;R',
      ]);
    }
  }

  ngOnDestroy(): void {
    if (this.formInstance) {
      this.formInstance.events.off(); // Clean up listeners
      this.formInstance.off('change');
      this.formInstance.off('render');
      this.formInstance.off('submit');
      this.formInstance.off('prevPage');
      this.formInstance.off('nextPage');
      this.formInstance.destroy(true); // Destrói todos os event listeners e libera memória
    }
  }

  getTodasVersoesEtp(item: any, pageEvent?: any) {
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
    };
    this.gestaoEtpService.getTodasVersoesEtp(item.id, objParams).subscribe({
      next: (data: any) => {
        let versoes = data.content || [];
        let totalElements = data.totalElements;
        this.VERSOES_ETP.open(versoes, totalElements, this.etpEditar.descricao);
      },
      error: (e: any) => {
        this.alertUtils.handleError(e);
      },
    });
  }

  gravarEtp(objEtp: any) {
    const id = objEtp?.id;
    const obj = {
      formulario: Number(objEtp?.formulario?.id),
      tipoLicitacao: Number(objEtp?.tipoLicitacao?.id),
      situacao: objEtp?.situacao?.id,
      descricao: objEtp?.descricao,
      etpPai: objEtp?.etpPai,
      versao: objEtp?.versao,
      ano: objEtp?.ano ? Number(objEtp?.ano) : null,
      etpNumeracao: objEtp?.etpNumeracao ? objEtp?.etpNumeracao : null,
      etapa: objEtp?.etapa ? Number(objEtp?.etapa) : null,
      processoSei: objEtp?.processoSei ? objEtp?.processoSei : null,
      unidadeId: objEtp?.unidadeId ? objEtp?.unidadeId : null,
    };
    if (id === undefined) {
      this.gestaoEtpService.postEtp(obj).subscribe({
        next: (etp: any) => {
          this.alertUtils.handleSucess(this.mensagens.MSG_SALVO_SUCESSO);
          this.reloadFormularioEtpComCadastrarEtp();
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoEtpService.putEtp(id, objEtp).subscribe({
        next: (etp: any) => {
          this.reloadFormularioEtpComCadastrarEtp();
          this.alertUtils.handleSucess(this.mensagens.MSG_ALTERADO_SUCESSO);
          this.navegarEtp(etp);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  reloadFormularioEtpComCadastrarEtp() {
    if (this.modalRef) {
      this.formRender = { components: [] };
      this.initObjectForm();
      this.CADASTRAR_ETP.close(true);
      this.modalRef.close();
      this.fecharModalFormularioEtp.emit();
    }
  }

  reloadPublicarEtp() {
    this.publicarEtp(this.etpEditar, 'MINUTA');
  }

  publicarEtp(obj: any, acao: any) {
    const id = obj?.id;
    const objFormulario = Object.values(AcoesEnum).find(
      (value) => value === acao
    );
    this.gestaoEtpService.patchEtp(id, objFormulario).subscribe({
      next: (etp: any) => {
        this.alertUtils.handleSucess(
          `Ação ` + objFormulario?.toLowerCase() + ` realizada com sucesso`
        );
        this.reloadFormularioEtp();
        this.navegarEtp(etp);
        this.alertUtils.handleSucess(this.mensagens.MSG_ALTERADO_SUCESSO);
      },
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  trocarSituacaoEtp(obj: any, acao: any) {
    const id = obj?.id;
    const objFormulario = Object.values(AcoesEnum).find(
      (value) => value === acao
    );
    let msg = `
    Deseja ${objFormulario?.toLowerCase()} o ETP?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpService.patchEtp(id, objFormulario).subscribe({
          next: (etp: any) => {
            this.alertUtils.handleSucess(
              `Ação ` + objFormulario?.toLowerCase() + ` realizada com sucesso`
            );
            this.reloadFormularioEtp();
            if (
              acao === 'FECHAR' ||
              acao === 'CANCELAR' ||
              acao === 'SUSPENDER'
            ) {
              this.navegarEtp(etp);
            }
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
      }
    });
  }

  versionarEtp(item: any) {
    let msg = `
    Deseja criar uma versão com base no ETP - ${item.descricao}?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.VERSIONAR_ETP.open(item);
      }
    });
  }

  executaVersionar(etp: any) {
    this.gestaoEtpService.versionarEtp(etp.id, etp.motivo).subscribe({
      next: (etp: any) => {
        this.alertUtils.handleSucess(`Versão gerada com sucesso`);
        this.reloadFormularioEtp();
        this.navegarEtp(etp);
      },
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  navegarEtp(etp: any) {
    this.elaborarEtp(etp);
  }

  elaborarEtp(itemEtp: any, visualizarEtp: boolean = false) {
    if (
      itemEtp.situacao?.chave === 'PUBLICADO' ||
      itemEtp.situacao?.chave === 'FECHADO'
    ) {
      visualizarEtp = true;
    }
    itemEtp.unidadeUsarioLogado = this.unidadeUsarioLogado;
    const objConstrutorFormulario = {
      id: itemEtp?.id,
      versao: itemEtp?.versao,
      idFormulario: itemEtp?.formulario?.id,
      jsonForm: itemEtp?.formulario?.jsonForm,
      jsonDados: itemEtp?.jsonDados,
      tipoContratacao: itemEtp?.tipoLicitacao?.descricao,
      tipoContratacaoId: itemEtp?.tipoLicitacao?.id,
      tipoContratacaoChave: itemEtp?.tipoLicitacao?.chave,
      descricao: itemEtp?.descricao,
      processoSei:
        itemEtp.numeroProcessoSei !== null
          ? itemEtp.numeroProcessoSei + '/' + itemEtp.anoProcessoSei
          : '',
      numeroEtp:
        itemEtp.etpNumeracao !== null
          ? itemEtp.etpNumeracao + '/' + itemEtp.ano
          : '',
      visualizar: visualizarEtp,
      situacao: itemEtp.situacao,
    };
    this.open({
      etp: objConstrutorFormulario,
      item: itemEtp,
      formularioList: this.formularios,
      tipoLicitacaoList: this.etpTipoLicitacaoList,
      situacaoList: this.situacaoList,
      etapaList: this.etapaList,
      unidadeList: this.unidadeList,
    });
  }

  elaborarEtpVersoes(itemEtpVersoes: any, visualizarEtp: boolean = false) {
    if (
      itemEtpVersoes.situacao?.chave === 'PUBLICADO' ||
      itemEtpVersoes.situacao?.chave === 'FECHADO'
    ) {
      visualizarEtp = true;
    }
    itemEtpVersoes.unidadeUsarioLogado = this.unidadeUsarioLogado;
    const objConstrutorFormulario = {
      id: itemEtpVersoes?.id,
      versao: itemEtpVersoes?.versao,
      idFormulario: itemEtpVersoes?.formulario?.id,
      jsonForm: itemEtpVersoes?.formulario?.jsonForm,
      jsonDados: itemEtpVersoes?.jsonDados,
      tipoContratacao: itemEtpVersoes?.tipoLicitacao?.descricao,
      tipoContratacaoId: itemEtpVersoes?.tipoLicitacao?.id,
      tipoContratacaoChave: itemEtpVersoes?.tipoLicitacao?.chave,
      descricao: itemEtpVersoes?.descricao,
      processoSei:
        itemEtpVersoes.numeroProcessoSei !== null
          ? itemEtpVersoes.numeroProcessoSei +
            '/' +
            itemEtpVersoes.anoProcessoSei
          : '',
      numeroEtp:
        itemEtpVersoes.etpNumeracao !== null
          ? itemEtpVersoes.etpNumeracao + '/' + itemEtpVersoes.ano
          : '',
      visualizar: visualizarEtp,
      situacao: itemEtpVersoes.situacao,
    };
    this.reloadFormularioEtpVersoes();
    this.open({
      etp: objConstrutorFormulario,
      item: itemEtpVersoes,
      formularioList: this.formularios,
      tipoLicitacaoList: this.etpTipoLicitacaoList,
      situacaoList: this.situacaoList,
      etapaList: this.etapaList,
      unidadeList: this.unidadeList,
    });
  }

  public open(openEtp: OpenEtp): Promise<boolean> {
    this.etpEditar = {
      unidadeId: openEtp.etp.unidadeId,
      ...openEtp.item,
      propriedade: 'Propriedades',
    };
    this.etpDelegado = openEtp.etpDelegado || false;
    getEnvironment().etpPartesId = this.etpEditar?.formulario?.id;
    this.etapaEtp = openEtp.item.etpEtapa;
    this.formularios = openEtp.formularioList;
    this.etpTipoLicitacaoList = openEtp.tipoLicitacaoList;
    this.situacaoList = openEtp.situacaoList;
    this.etapaList = openEtp.etapaList;
    this.unidadeList = openEtp.unidadeList;
    this.unidadeUsarioLogado = openEtp.item.unidadeUsarioLogado;
    this.tipoPermissaoDelegacao = openEtp.item.tipoPermissaoDelegacao;
    this.clickRetornar = false;
    this.initObjectForm();
    this.setDadosFormulario(openEtp.etp);
    this.dadosEtp = openEtp.etp;
    this.dadosEtpCompleto = openEtp;
    this.nomeArquivo =
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
    this.opsVisualizarMenuLateral(openEtp.etp);

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        fullscreen: true,
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
      });
      this.menuIndex = 0;
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  estaAberto() {
    return (
      this.etpEditar?.situacao?.chave === 'ABERTO' &&
      this.hasEtpConsultaPermission === false &&
      this.tipoPermissaoDelegacao !== 'CONSULTA' &&
      this.etpEditar.etpEtapa.chave !== 'EM_ANALISE'
    );
  }

  opsVisualizarMenuLateral(etp: any) {
    // Elaboração:0 | Relatório:1 | Propriedades:2 | Fechar:3 | Cancelar:4 | Suspender:5
    // Versionar:6 | Envio SEI:7 | Comparar Versões:8 | Versões:9 | Delegar Acesso:10
    // Sair:11 |

    this.desabilitaTudo();

    if (this.etpEditar.situacao?.chave === 'ABERTO') {
      this.habilita([0, 1, 2, 3, 4, 5, 8, 9, 10, 11]);
    }

    if (this.etpEditar.situacao?.chave === 'FECHADO') {
      this.habilita([0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11]);
    }

    if (this.etpEditar.situacao?.chave === 'PUBLICADO') {
      this.habilita([0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11]);
    }

    if (this.etpEditar.situacao?.chave === 'CANCELADO') {
      this.habilita([0, 1, 2, 6, 8, 9, 11]);
    }

    if (this.etpEditar.situacao?.chave === 'SUSPENSO') {
      this.habilita([0, 1, 2, 6, 8, 9, 11]);
    }

    if (
      this.etpEditar.etpEtapa?.chave === 'AGUARDANDO_ANALISE' ||
      this.etpEditar.etpEtapa?.chave === 'AGUARDANDO_REVISAO' ||
      this.etpEditar.etpEtapa?.chave === 'AGUARDANDO_RETORNO_ANALISE'
    ) {
      this.desabilitaTudo();
      this.habilita([0, 1, 2, 8, 11]);
    }

    if (this.etpEditar.etpEtapa?.chave === 'ANALISADO') {
      this.desabilitaTudo();
      this.habilita([0, 1, 2, 6, 8, 11]);
    }

    if (
      this.hasEtpConsultaPermission ||
      this.tipoPermissaoDelegacao === 'CONSULTA'
    ) {
      this.desabilitaTudo();
      this.habilita([0, 1, 2, 8, 9, 11]);
    }

    if (this.etpDelegado) {
      this.desabilitar([9, 10]);
    }
  }

  async salvarFoiAlterado() {
    if (this.compararAlteracoesJsonDados()) {
      const msgsalvar = 'Deseja salvar o que já foi alterado?';
      await this.alertUtils.confirmDialog(msgsalvar).then((dataConfirme) => {
        if (dataConfirme) {
          this.submit(JSON.stringify(this.formInstance.submission.data));
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
    return this.formInstance.checkValidity(
      this.formInstance.submission.data,
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
            this.submit(JSON.stringify(this.formInstance.submission.data));
            this.ngOnDestroy();
            this.reloadFormularioEtp();
          } else {
            this.clickRetornar = false;
            this.ngOnDestroy();
            this.reloadFormularioEtp();
          }
        });
      } else {
        let msg = this.parametros.MSG_SAIR_CONTRUROR;
        this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
          if (dataConfirme) {
            this.ngOnDestroy();
            this.reloadFormularioEtp();
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

  compararAlteracoesJsonDados(): boolean {
    let retorno = false;

    if (
      JSON.stringify(this.dadosOriginal) !== JSON.stringify(this.dadosAlterados)
    ) {
      retorno = true;
    }

    return retorno;
  }

  reloadFormularioEtp() {
    if (this.modalRef) {
      this.formRender = { components: [] };
      this.initObjectForm();
      this.fecharModalFormularioEtp.emit();
      this.modalRef.close();
      this.desbloquearEtp.emit({
        id: this.etpEditar?.id,
        bloqueado: false,
      });
    }
  }

  reloadFormularioEtpVersoes() {
    if (this.modalRef) {
      this.formRender = { components: [] };
      this.initObjectForm();
      this.fecharModalFormularioEtp.emit();
      this.VERSOES_ETP.close();
      this.modalRef.close();
    }
  }

  private initObjectForm() {
    this.etp = {
      jsonForm: '',
      jsonDados: '',
      jsonDadosTemp: '',
      id: '',
      idFormulario: '',
      jsonDadosOriginal: '',
    };
  }

  private setDadosFormulario(etp: any) {
    this.verificarUltimaVersaoFormulario(etp);
    if (etp.jsonDados) {
      this.etp.jsonDados = etp.jsonDados;
      this.etp.jsonDadosOriginal = etp.jsonDados;
      this.etp.jsonDadosTemp = etp.jsonDados;
      this.etp.jsonDadosAnteriores = etp.jsonDados;
    } else {
      this.etp.jsonDados = '';
      this.etp.jsonDadosOriginal = '';
      this.etp.jsonDadosAnteriores = '';
      this.etp.jsonDadosTemp = '';
    }
    this.tipoContratacao = etp.tipoContratacao;
    this.descricao = etp?.descricao;
    this.processoSei = etp.processoSei;
    this.numeroEtp = etp.numeroEtp;
    this.etpNumeracaoTermoOrientacao = etp.etpNumeracaoTermoOrientacao
      ? etp.etpNumeracaoTermoOrientacao
      : '';
    this.descricaoSituacao = etp?.situacao?.descricao;
  }

  private verificarUltimaVersaoFormulario(etp: any) {
    this.gestaoFormularioService
      .consultarUltimaVersaoFormulario(etp.idFormulario)
      .subscribe({
        next: (formulario: any) => {
          if (
            formulario.id !== null &&
            formulario.id !== etp.idFormulario &&
            this.etpEditar.situacao?.chave === 'ABERTO'
          ) {
            this.COMPARAR_FORMULARIO_HTML.open(
              etp.idFormulario,
              formulario.id,
              etp,
              formulario
            );
          } else {
            this.etp.jsonForm = etp.jsonForm;
            this.etp.id = etp.id;
            this.formRender = JSON.parse(this.etp.jsonForm);
          }
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  public cancelarNovaVersao(etp: any) {
    this.etp.jsonForm = etp.jsonForm;
    this.etp.id = etp.id;
    this.formRender = JSON.parse(this.etp.jsonForm);
  }

  public aceitarNovaVersao(etp: any, formulario: any) {
    const etpAceitarNovaVersaoFormulario = {
      ...etp,
      motivo: 'Versionado pelo usuário devido nova versão do modelo.',
    };
    this.executaVersionar(etpAceitarNovaVersaoFormulario);
  }

  desabilitarComponents(formulario: any) {
    let component = FormioUtils.getComponent(
      formulario.components,
      'PAR_TIPO_CONTRATACAO_PAR',
      true
    );
    if (component) component.disabled = true;

    component = FormioUtils.getComponent(
      formulario.components,
      'PAR_PROCESSO_SEI_PAR',
      true
    );
    if (component) component.disabled = true;

    component = FormioUtils.getComponent(
      formulario.components,
      'PAR_NUMERO_ETP_PAR',
      true
    );
    if (component) component.disabled = true;
  }

  private injectRender(elemento: HTMLElement) {
    if (this.INSTANCE_FORMIO !== 'ETP') return;

    if (this.formInstance) {
      this.ngOnDestroy();
    }

    const formulario = JSON.parse(JSON.stringify(this.formRender, null, 4));
    this.desabilitarComponents(formulario);
    this.setaClearOnHide(formulario);
    this.registraTemplatesCustomizados();
    const optionsFormulario = { ...this.options };

    formulario.somenteLeitura = false;

    if (
      this.hasEtpConsultaPermission ||
      this.etpEditar.situacao?.chave !== 'ABERTO' ||
      this.tipoPermissaoDelegacao === 'CONSULTA' ||
      this.etpEditar.etpEtapa.chave === 'EM_ANALISE'
    ) {
      this.setaReadOnly(formulario);
      optionsFormulario.somenteLeitura = true;
    }

    Formio.createForm(elemento, formulario, optionsFormulario)
      .then((instance: any) => {
        this.formInstance = instance;

        this.configurarEventos(instance, formulario);
        this.setarDadosIniciais(instance);

        this.setarPropriedades();
        this.setarSubmission(instance);
      })
      .catch((error) => this.mensagemErro(error));
  }

  private configurarEventos(instance: any, formulario: any) {
    instance.on('change', (event: any) => {
      try {
        setTimeout(() => {
          if (event.changed?.component) {
            this.dadosAlterados = _.cloneDeep(event.data);
          }
        }, 0);
      } catch (error) {
        this.mensagemErro(error);
      }
    });

    instance.once('render', () => this.onFirstRender(instance));
    instance.on('render', () => this.onRender(instance));
    instance.on('submit', () => this.onSubmit(instance));
    instance.on('prevPage', (event: any) =>
      this.safeCallback(() => this.onNext(event?.submission))
    );
    instance.on('nextPage', (event: any) =>
      this.safeCallback(() => this.onNext(event?.submission))
    );
  }

  private onFirstRender(instance: any) {
    try {
      this.formInstance = instance;
      setTimeout(() => {
        this.validaPreenchimento(instance, instance.submission.data, true);
      }, 100);

      this.dadosOriginal = _.cloneDeep(instance.submission.data);
      this.dadosAlterados = _.cloneDeep(instance.submission.data);

      if (
        this.etpEditar.situacao?.chave !== 'ABERTO' ||
        this.tipoPermissaoDelegacao === 'CONSULTA'
      ) {
        instance.components.forEach(
          (component: any) => (component.disabled = true)
        );
        instance.triggerRedraw();
      }
    } catch (error) {
      this.mensagemErro(error);
    }
  }

  private onRender(instance: any) {
    try {
      this.setupBotao('btnValidaFormulario', () => {
        setTimeout(() => {
          this.validaPreenchimento(instance, instance.submission.data, true);
          this.submit(JSON.stringify(instance.submission.data));
        }, 0);
      });

      this.setupBotao('btnFechaFormulario', () => this.close());
    } catch (error) {
      this.mensagemErro(error);
    }
  }

  private onSubmit(instance: any) {
    try {
      this.submit(JSON.stringify(instance.submission.data));
    } catch (error) {
      this.mensagemErro(error);
    }
  }

  private setupBotao(id: string, callback: () => void) {
    let btn = document.getElementById(id);
    if (!btn) return;

    btn.replaceWith(btn.cloneNode(true));
    const newBtn = document.getElementById(id);
    newBtn?.addEventListener('click', callback);
  }

  private safeCallback(fn: () => void) {
    try {
      fn();
    } catch (error) {
      this.mensagemErro(error);
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

  mensagemErro(error: any) {
    const erro = error as Error;
    this.alertUtils.alertDialog(
      'Erro ao carregar Formio: ' + JSON.stringify(erro.stack)
    );
    console.log('Erro ao carregar Formio:', erro.stack);
  }

  setarPropriedades() {
    try {
      const jsonObject: Record<string, any> =
        this.etp.jsonDados.length >= 10 ? JSON.parse(this.etp.jsonDados) : {};
      jsonObject['PAR_PROCESSO_SEI_PAR'] = this.dadosEtp.processoSei;
      jsonObject['PAR_NUMERO_ETP_PAR'] = this.dadosEtp.numeroEtp;
      jsonObject['PAR_TIPO_CONTRATACAO_PAR'] =
        this.dadosEtp.tipoContratacaoChave;
      this.etp.jsonDados = JSON.stringify(jsonObject);
      this.etp.jsonDadosTemp = jsonObject;
    } catch (error) {
      console.log(error);
    }
  }

  private setarSubmission(instance: any) {
    try {
      const submissionData = {
        data: JSON.parse(this.etp.jsonDados),
      };

      setTimeout(() => {
        instance.setSubmission(submissionData, {
          fromSubmission: false,
        });
        instance.triggerRedraw();
      }, 0);
    } catch (error) {
      this.mensagemErro(error);
    }
  }

  public onNext(param: any) {
    let dados = JSON.stringify(this.etp.jsonDadosTemp);
    this.etp.jsonDados = dados;
  }

  public submit(dados: any) {
    const dadosInformados = {
      id: this.etp?.id,
      jsonDados: dados,
    };
    this.etp.jsonDados = dados;

    setTimeout(() => {
      this.gravarDadosFormularioEtpNext(dadosInformados);
    }, 0);
  }

  renderFormio(): void {
    let elemento = document.getElementById('formulario');
    if (elemento) {
      this.injectRender(elemento);
    }
  }

  toggleFullScreen(element: any) {
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

  openFullScreen(nameElement: string) {
    let meuDiv = document.getElementById(nameElement);
    this.toggleFullScreen(meuDiv);
  }

  updateMenu() {
    this.items = [
      {
        label: 'Elaboração',
        icon: 'fa fa-fw fa-building',
        command: () => (this.menuIndex = 0),
        disabled: this.itemMenu[0],
      },
      {
        icon: 'fa fa-fw fa-file-pdf',
        label: 'Relatório',
        command: async () => {
          await this.salvarFoiAlterado();
          const value = this.formInstance.data['PAR_PARTES_ETP_PAR'];
          if (value && value.length > 0) {
            await this.vaiUsarSigilo();
          }
          this.salvarRelatorio();
        },
        disabled: this.itemMenu[1],
      },
      {
        icon: 'fa fa-fw fa-file-pen',
        label: 'Propriedades',
        command: async () => {
          await this.salvarFoiAlterado();
          this.CADASTRAR_ETP.open(
            this.etpEditar,
            this.formularios,
            this.etpTipoLicitacaoList,
            this.situacaoList,
            this.etapaList,
            this.unidadeList,
            this.unidadeUsarioLogado
          );
        },
        disabled: this.itemMenu[2],
      },
      {
        label: 'Ações',
        icon: 'fa fa-fw fa-cog',
        items: [
          {
            icon: 'fa fa-fw fa-lock',
            label: 'Fechar',
            command: async () => {
              const podeFechar = this.validaFormulario();
              if (!podeFechar) {
                this.alertUtils.toastrWarningMsg(
                  'O ETP tem campo obrigatório não preenchido, favor verificar antes de fechar o ETP!!'
                );
                return;
              }
              await this.salvarFoiAlterado();
              this.trocarSituacaoEtp(this.etpEditar, 'FECHAR');
            },
            disabled: this.itemMenu[3],
          },
          {
            icon: 'fa fa-fw fa-ban',
            label: 'Cancelar',
            command: async () => {
              await this.salvarFoiAlterado();
              this.trocarSituacaoEtp(this.etpEditar, 'CANCELAR');
            },
            disabled: this.itemMenu[4],
          },
          {
            icon: 'fa fa-fw fa-circle-pause',
            label: 'Suspender',
            command: async () => {
              await this.salvarFoiAlterado();
              this.trocarSituacaoEtp(this.etpEditar, 'SUSPENDER');
            },
            disabled: this.itemMenu[5],
          },
        ],
      },

      {
        icon: 'fa fa-fw fa-square-plus',
        label: 'Versionar',
        command: async () => {
          await this.salvarFoiAlterado();
          this.versionarEtp(this.etpEditar);
        },
        disabled: this.itemMenu[6],
      },
      {
        icon: 'fa fa-fw fa-paper-plane',
        label: 'Envio SEI/Análise',
        command: () => this.ENVIAR_SEI.open(),
        disabled: this.itemMenu[7],
      },

      {
        icon: 'fa fa-solid fa-code-branch',
        label: 'Versões',
        command: () => {
          this.getTodasVersoesEtp(this.etpEditar, this.page);
        },
        disabled: this.itemMenu[9],
      },
      {
        icon: 'fa fa-fw fa-code-compare',
        label: 'Comparar Versões',
        command: () => (this.menuIndex = 8),
        disabled: this.itemMenu[8],
      },
      {
        icon: 'fa fa-solid fa-user-plus',
        label: 'Delegar Acesso',
        command: async () => {
          await this.salvarFoiAlterado();
          this.DELEGAR_ACESSO.open(this.etp.id, 'ETP');
        },
        disabled: this.itemMenu[10],
      },
      {
        icon: 'fa fa-solid fa-history',
        label: 'Histórico',
        command: () => {
          this.gestaoEtpService
            .getLogsEtp(this.etp.id)
            .subscribe((response) => {
              if (response) {
                this.LOGS_ETP.open(response);
              }
            });
        },
        disabled: this.itemMenu[14],
      },
      {
        icon: 'fa fa-fw  fa-sign-out',
        label: 'Sair',
        command: () => {
          this.close();
        },
        disabled: this.itemMenu[11],
      },
    ];
  }

  desabilitaTudo() {
    let j = 0;
    for (let i = 0; i <= 13; i++) {
      this.itemMenu[i] = true;
    }
  }

  habilita(index: number[]) {
    index.forEach((i) => {
      this.itemMenu[i] = false;
    });

    this.updateMenu();
  }

  desabilitar(index: number[]) {
    index.forEach((i) => {
      this.itemMenu[i] = true;
    });

    this.updateMenu();
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
          windowClass: 'modal-largura-customizada-registrar',
        }
      );
      this.modalRefRegistrar.result.then((result) => {
        resolve(result);
      });
    });
  }

  public openLinkCustom(texto: any): Promise<boolean> {
    this.linkCustomForm = '';
    this.textoLinkCustomForm = texto;
    this.closeRegistrarForm();

    return new Promise<boolean>((resolve) => {
      this.modalRefLinkCustom = this.modalService.open(this.modalLinkCustom, {
        centered: true,
        backdrop: 'static', // Não fechar ao clicar fora
        keyboard: false,
        fullscreen: false,
        windowClass: 'modal-largura-customizada-registrar',
      });
      this.modalRefLinkCustom.result.then((result) => {
        resolve(result);
      });
    });
  }

  registrarEnvioseiEtpForm() {
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
        this.closeRegistrarForm();
      },
    });
  }

  closeRegistrarForm() {
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

  registrarLinkCustomForm() {
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

  evaluateConditional(component: any, dados: Record<string, any>): boolean {
    if (component.hasOwnProperty('conditional')) {
      const conditional = component.conditional;

      if (
        !conditional.hasOwnProperty('when') ||
        typeof conditional.when !== 'string'
      ) {
        return true;
      }

      const when: string = conditional.when;
      const eq: string = conditional.eq;
      const show: boolean = conditional.show;

      if (dados.hasOwnProperty(when)) {
        let dado: string = '';
        const dadoOriginal = dados[when];

        if (typeof dadoOriginal === 'boolean') {
          dado = dadoOriginal.toString();
        } else if (typeof dadoOriginal === 'number') {
          dado = dadoOriginal.toString();
        } else if (typeof dadoOriginal === 'string') {
          dado = dadoOriginal;
        }

        return dado === eq ? Boolean(show) : !Boolean(show);
      } else {
        return false;
      }
    }
    return true;
  }

  validaPreenchimento(formulario: any, dados: any, primeiraVez: boolean) {
    // valida os campos de input
    FormioUtils.eachComponent(
      formulario.components,
      (component: any) => {
        let isValid = false;
        if (
          component.type == 'botaoajuda' ||
          component.type == 'textoajuda' ||
          component.type == 'notainterna' ||
          component.type == 'columns'
        ) {
          isValid = true;
        }

        if (typeof component.checkValidity === 'function') {
          try {
            isValid = component.checkValidity(dados, false);
            component.parent.filled = true;
            component.parent.component.filled = true;
            component.filled = isValid;
          } catch (error) {
            console.log(error);
          }
        }

        if (component.components && component.components.length > 0) {
          this.validaPreenchimento(component, dados, primeiraVez);
        }
      },
      true
    );

    this.setaPanel(formulario);

    if (primeiraVez) {
      formulario.triggerRedraw();
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
    this.gestaoEtpService.patchNextEtp(id, objFormulario).subscribe({
      next: () => {},
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  registraTemplatesCustomizados() {
    Templates.current.wizard = this.options.templates.wizard;
    Templates.current.componentModal = this.options.templates.componentModal;
    Templates.current.modalPreview = this.options.templates.modalPreview;
    Templates.current.wizardNav = this.options.templates.wizardNav;
    Templates.current.input = this.options.templates.input;
    Templates.current.panel = this.options.templates.panel;
  }

  setaClearOnHide(formulario: any) {
    FormioUtils.eachComponent(
      formulario.components,
      (component: any) => {
        component.clearOnHide = false;
        if (component.components && component.components.length > 0) {
          this.setaClearOnHide(component);
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
        component.disabled = true;
        if (component.components && component.components.length > 0) {
          this.setaReadOnly(component);
        }
      },
      true
    );
  }
}
