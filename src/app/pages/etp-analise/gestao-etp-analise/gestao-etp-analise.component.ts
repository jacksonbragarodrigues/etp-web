import { Page } from '@administrativo/components';
import { AuthService } from '@administrativo/core';
import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { getEnvironment } from 'src/app/app.component';
import { EtpEtapaService } from 'src/app/services/etp-etapa-service.service';
import { EtpTipoLicitacaoService } from 'src/app/services/etp-tipo-licitacao-service.service';
import { FichaAnaliseAnalistasService } from 'src/app/services/ficha-analise-analistas.service';
import { FichaAnaliseService } from 'src/app/services/ficha-analise.service';
import { GestaoEtpAnaliseService } from 'src/app/services/gestao-etp-analise.service';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { Sarhclientservice } from 'src/app/services/sarhclient.service';
import { SeiService } from 'src/app/services/sei.service';
import { SituacaoFormularioServiceService } from 'src/app/services/situacao-formulario-service.service';
import { AcoesEnum } from 'src/app/shared/models/acoes.enum';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { AlertUtils } from 'src/utils/alerts.util';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { CadastrarEtpComponent } from '../../etp/gestao-etp/modal/cadastrar-etp/cadastrar-etp.component';
import { VersionarComponent } from '../../etp/gestao-etp/modal/versionar/versionar.component';
import { VersoesEtpComponent } from '../../etp/gestao-etp/modal/versoes-etp/versoes-etp.component';
import GestaoBase from '../../shared/gestao-base';
import { FichaAnaliseComponent } from '../modal/ficha-analise/ficha-analise.component';
import { FormularioEtpAnaliseComponent } from '../modal/formulario-etp-analise/formulario-etp-analise.component';

@Component({
  selector: 'app-gestao-etp-analise',
  templateUrl: './gestao-etp-analise.component.html',
  styleUrl: './gestao-etp-analise.component.scss',
})
export class GestaoEtpAnaliseComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('fichaAnalise', { static: true })
  FICHA_ANALISE!: FichaAnaliseComponent;

  @ViewChild('cadastrar_etp', { static: true })
  CADASTRAR_ETP!: CadastrarEtpComponent;

  @ViewChild('versionar_etp', { static: true })
  VERSIONAR_ETP!: VersionarComponent;

  @ViewChild('formulario_etp_analise', { static: true })
  CONSTRUI_FORMULARIO!: FormularioEtpAnaliseComponent;

  @ViewChild('versoes_etp', { static: true })
  VERSOES_ETP!: VersoesEtpComponent;

  @ViewChild('menu') menu: Menu | undefined;

  selectedRowDataAnalise: any | null = null;
  gestaoETPFiltroForm!: FormGroup;
  pageEtpAnalise: Page<any> = new Page<any>();
  gestaoBase: GestaoBase = new GestaoBase();

  public toggleForm = false;
  public descricao: string = '';

  mensagens = {
    MSG_ALTERADO_SUCESSO_ANALISE: 'Alterado com sucesso',
    MSG_SALVO_SUCESSO_ANALISE: 'Salvo com sucesso',
  };

  desabilitarCampos = false;
  etpDelegadoListAnalise: any[] = [];
  formularios: any[] = [];
  etpTipoLicitacaoListAnalise: any[] = [];
  situacaoList: any[] = [];
  etapaList: any[] = [];
  unidadesList: any[] = [];
  servidoresList: any[] = [];
  unidadeUsuarioLogado: any;
  private lazyLoading: boolean = true;
  timersBloqueio = new Map();

  constructor(
    private formBuilder: FormBuilder,
    private seiService: SeiService,
    private alertUtils: AlertUtils,
    private gestaoEtpAnaliseService: GestaoEtpAnaliseService,
    private etpTipoLicitacaoService: EtpTipoLicitacaoService,
    private gestaoFormularioService: GestaoFormularioService,
    private sarhclientservice: Sarhclientservice,
    private etpEtapaService: EtpEtapaService,
    private situacaoFormularioService: SituacaoFormularioServiceService,
    private biblioteca: BibliotecaUtils,
    public authService: AuthService,
    private fichaAnaliseService: FichaAnaliseService,
    private fichaAnaliseAnalistasService: FichaAnaliseAnalistasService
  ) {}

  async ngOnInit() {
    this.iniciaPageEtpAnalise();
    await this.getEtapasEtpAnalise();
    await this.getSituacaoFormularioEtpAnalise();
    this.getTodosFormulariosEtpAnalise();
    this.getEtpTipoLicitacaoEtpAnalise();
    this.getUnidadesEtpAnalise();
    this.getServidorsesEtpAnalise();
    this.getDadosUnidadeServidorLogadoEtpAnalise();
    this.limparCamposEtpAnalise();
    this.tableLazyLoading();
  }

  bloquearEtpAnalise(dadosInformados: any) {
    this.cancelTimerEtpAnalise(dadosInformados?.id);
    const id = dadosInformados?.id;
    const objFormulario = {
      bloqueado: dadosInformados.bloqueado,
    };
    this.gestaoEtpAnaliseService
      .putBloqueioEtpAnalise(id, objFormulario)
      .subscribe({
        next: () => {},
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  executarAposMinutosEtpAnalise(idEtp: any) {
    this.cancelTimerEtpAnalise(idEtp);
    const timerBloquio = setTimeout(async () => {
      await lastValueFrom(
        this.gestaoEtpAnaliseService.putBloqueioEtpAnalise(idEtp, {
          bloqueado: false,
        })
      );
    }, getEnvironment().bloqueioTimeOut * 60 * 1000);
    this.timersBloqueio.set(idEtp, timerBloquio);
  }

  cancelTimerEtpAnalise(id: any) {
    if (this.timersBloqueio.has(id)) {
      clearTimeout(this.timersBloqueio.get(id));
      this.timersBloqueio.delete(id);
    }
  }

  limparFiltrosAvancadosEtpAnalise(event: any) {
    this.formControl['unidadeId'].setValue(null);
    this.formControl['etpEtapa'].setValue(null);
    this.formControl['dataRegistroInicial'].setValue(null);
    this.formControl['dataRegistroFinal'].setValue(null);
    this.formControl['servidor'].setValue(null);
  }

  iniciaPageEtpAnalise() {
    this.pageEtpAnalise = {
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: this.pageEtpAnalise.totalElements,
      totalPages: Math.ceil(
        this.pageEtpAnalise.totalElements / this.pageEtpAnalise.size
      ),
    };

    this.gestaoETPFiltroForm = this.formBuilder.group({
      formularioEtp: null,
      tipoLicitacaoEtp: null,
      situacaoEtp: null,
      todasVersoes: false,
      descricaoFullText: null,
      processoSei: null,
      numeroEtp: null,
      unidadeId: null,
      etpEtapa: null,
      dataRegistroInicial: null,
      dataRegistroFinal: null,
      servidor: null,
      soMinhasAnalises: null,
    });

    this.inicializarSituacaoEtpAnalise();
  }

  getTodosFormulariosEtpAnalise() {
    this.gestaoFormularioService
      .getFormulariosPublicados()
      .subscribe((formulariosList) => {
        this.formularios = formulariosList;
      });
  }

  async getSituacaoFormularioEtpAnalise() {
    this.situacaoList = await firstValueFrom(
      this.situacaoFormularioService.getSituacaoFormulario()
    );

    this.situacaoList = this.situacaoList.filter((etapa) => {
      return etapa.chave === 'MINUTA';
    });

    this.inicializarSituacaoEtpAnalise();
  }

  inicializarSituacaoEtpAnalise() {
    const situacoesDefault = ['MINUTA'];
    const situacoesPadrao = this.situacaoList.filter((s: any) =>
      situacoesDefault.includes(s.chave)
    );

    const etapasDefault = [
      'AGUARDANDO_ANALISE',
      'AGUARDANDO_REVISAO',
      'AGUARDANDO_RETORNO_ANALISE',
      'ANALISADO',
    ];
    const etapasPadrao = this.etapaList.filter((s: any) =>
      etapasDefault.includes(s.chave)
    );

    this.gestaoETPFiltroForm.patchValue(
      {
        situacaoEtp: situacoesPadrao,
        etpEtapa: etapasPadrao,
        soMinhasAnalises: true,
      },
      { emitEvent: true }
    );
  }

  getEtpTipoLicitacaoEtpAnalise() {
    this.etpTipoLicitacaoService
      .getEtpTipoLicitacaoLista()
      .subscribe((tipoLicitacaoList) => {
        this.etpTipoLicitacaoListAnalise = tipoLicitacaoList;
      });
  }

  async getEtapasEtpAnalise() {
    this.etapaList = await firstValueFrom(
      this.etpEtapaService.getEtpEtapaLista()
    );

    this.etapaList = this.etapaList.filter((etapa) =>
      [
        'AGUARDANDO_ANALISE',
        'AGUARDANDO_REVISAO',
        'AGUARDANDO_RETORNO_ANALISE',
        'ANALISADO',
      ].includes(etapa.chave)
    );
  }

  getUnidadesEtpAnalise() {
    this.sarhclientservice.getListaUnidades().subscribe((unidadesList) => {
      this.unidadesList = unidadesList;
    });
  }

  getServidorsesEtpAnalise() {
    this.gestaoEtpAnaliseService
      .consultarDadosServidorPorLoginEtpAnalise()
      .subscribe((servidoresList) => {
        this.servidoresList = servidoresList;
      });
  }

  getDadosUnidadeServidorLogadoEtpAnalise() {
    this.gestaoEtpAnaliseService
      .getDadosServidorLogado()
      .subscribe((dadosServidor: any) => {
        const dadosUnidadeSevidor = {
          id: dadosServidor.seqIdUnidade,
          descricao: dadosServidor.nomeUnidade,
          sigla: dadosServidor.sgUnidade,
        };
        this.unidadeUsuarioLogado = dadosUnidadeSevidor;
      });
  }

  cadastrarETPEtpAnalise() {
    this.CADASTRAR_ETP.open(
      null,
      this.formularios,
      this.etpTipoLicitacaoListAnalise,
      this.situacaoList,
      this.etapaList,
      [],
      this.unidadeUsuarioLogado
    );
  }

  editarETPEtpAnalise(item: any) {
    this.CADASTRAR_ETP.open(
      item,
      this.formularios,
      this.etpTipoLicitacaoListAnalise,
      this.situacaoList,
      this.etapaList,
      this.unidadesList,
      this.unidadeUsuarioLogado
    );
  }

  garvarDadosFormularioEtpEtpAnalise(dadosFormularioEtp: any) {
    const idAnalise = dadosFormularioEtp?.id;
    const objFormularioAnalise = {
      jsonDados: dadosFormularioEtp?.jsonDados,
    };
    this.gestaoEtpAnaliseService
      .putEtpAnalise(idAnalise, objFormularioAnalise)
      .subscribe({
        next: () => {},
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  gravarDadosFormularioEtpNextEtpAnalise(dadosFormularioEtp: any) {
    const idAnalise = dadosFormularioEtp?.id;
    const objFormularioAnalise = {
      jsonDados: dadosFormularioEtp?.jsonDados,
    };
    this.gestaoEtpAnaliseService
      .patchNextEtpAnalise(idAnalise, objFormularioAnalise)
      .subscribe({
        next: () => {},
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  atualizarFormularioEtpEtpAnalise(etp: any) {
    const id = etp?.id;
    const idFormulario = etp?.idFormulario;
    this.gestaoEtpAnaliseService
      .patchFormularioEtpAnalise(id, idFormulario)
      .subscribe({
        next: () => {},
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  async etpBloqueadoEtpAnalise(id: any) {
    const data: any = await lastValueFrom(
      this.gestaoEtpAnaliseService.getEtpAnaliseById(id)
    );
    return data;
  }

  async pegarUsuarioLogadoEtpAnalise() {
    return await firstValueFrom(this.authService.dadosUsuarioLogado);
  }

  verificarFichaAnalise(
    itemEtpAnalise: any,
    visualizar: boolean = false,
    etpDelegado = false
  ) {
    if (itemEtpAnalise.statusFichaDeAnalise == 'Não criada') {
      this.alertUtils
        .confirmDialog(
          'A Ficha de Análise e Atribuição de Analistas não foi criada, deseja criar ?'
        )
        .then((dataConfirme) => {
          if (dataConfirme) {
            this.abrirFichaAnalise(itemEtpAnalise);
          }
        });
    } else {
      this.elaborarEtpEtpAnalise(itemEtpAnalise, visualizar, etpDelegado);
    }
  }

  async elaborarEtpEtpAnalise(
    itemEtpAnalise: any,
    visualizar: boolean = false,
    etpDelegado = false
  ) {
    const tipoPermissaoDelegacao = itemEtpAnalise.tipoPermissaoDelegacao;
    const dadosBloqueio = await this.etpBloqueadoEtpAnalise(itemEtpAnalise?.id);
    const dadosUsuario = await this.pegarUsuarioLogadoEtpAnalise();
    const usuario = `${dadosUsuario?.login} - ${dadosUsuario?.nome}`;
    if (dadosBloqueio?.bloqueado && dadosBloqueio?.bloqueadoPor !== usuario) {
      this.alertUtils.alertDialog(
        `O etp está bloqueado por ${dadosBloqueio?.bloqueadoPor}`
      );
      return;
    }
    await lastValueFrom(
      this.gestaoEtpAnaliseService.putBloqueioEtpAnalise(itemEtpAnalise?.id, {
        bloqueado: true,
      })
    );
    this.executarAposMinutosEtpAnalise(itemEtpAnalise?.id);
    this.gestaoEtpAnaliseService
      .getEtpAnaliseById(itemEtpAnalise?.id)
      .subscribe({
        next: (data: any) => {
          itemEtpAnalise = data;
          itemEtpAnalise.tipoPermissaoDelegacao = tipoPermissaoDelegacao;
          if (
            itemEtpAnalise.situacao?.chave === 'PUBLICADO' ||
            itemEtpAnalise.situacao?.chave === 'FECHADO'
          ) {
            visualizar = true;
          }

          const objConstrutorFormularioEtpAnalise = {
            id: itemEtpAnalise?.id,
            versao: itemEtpAnalise?.versao,
            idFormulario: itemEtpAnalise?.formulario?.id,
            jsonForm: itemEtpAnalise?.etpFichaAnalise?.jsonForm,
            jsonDados: itemEtpAnalise?.etpFichaAnalise?.jsonDados,
            tipoContratacao: itemEtpAnalise?.tipoLicitacao?.descricao,
            tipoContratacaoId: itemEtpAnalise?.tipoLicitacao?.id,
            tipoContratacaoChave: itemEtpAnalise?.tipoLicitacao?.chave,
            descricao: itemEtpAnalise?.descricao,
            processoSei:
              itemEtpAnalise.numeroProcessoSei !== null
                ? itemEtpAnalise.numeroProcessoSei +
                  '/' +
                  itemEtpAnalise.anoProcessoSei
                : '',
            numeroEtp:
              itemEtpAnalise.etpNumeracao !== null
                ? itemEtpAnalise.etpNumeracao + '/' + itemEtpAnalise.ano
                : '',
            etpNumeracaoTermoOrientacao:
              itemEtpAnalise.etpNumeracaoTermoOrientacao !== null
                ? itemEtpAnalise.etpNumeracaoTermoOrientacao +
                  '/' +
                  itemEtpAnalise.ano
                : '',
            visualizar: visualizar,
            situacao: itemEtpAnalise.situacao,
            unidadeId: itemEtpAnalise.unidadeId,
            unidadeUsuarioLogado: this.unidadeUsuarioLogado,
            etpEtapa: itemEtpAnalise.etpEtapa,
          };
          this.CONSTRUI_FORMULARIO.open({
            etp: objConstrutorFormularioEtpAnalise,
            item: itemEtpAnalise,
            formularioList: this.formularios,
            tipoLicitacaoList: this.etpTipoLicitacaoListAnalise,
            situacaoList: this.situacaoList,
            etapaList: this.etapaList,
            unidadeList: this.unidadesList,
            etpDelegado: etpDelegado,
          });
        },
      });
  }

  tableLazyLoading(event: any = null) {
    this.pageEtpAnalise.content = [];
    this.selectedRowDataAnalise = null;
    this.getPesquisarEtpEtpAnalise(this.pageEtpAnalise, this.lazyLoading);
  }

  validaDataEtpAnalise(dataInicialAnalise: Date, dataFinalAnalise: Date) {
    if (dataInicialAnalise > dataFinalAnalise) {
      return false;
    }
    return true;
  }

  validaDataPesquisaEtpAnalise() {
    let dataRegistroInicialStr = this.gestaoETPFiltroForm.get(
      'dataRegistroInicial'
    )?.value;
    let dataRegistroFinalStr =
      this.gestaoETPFiltroForm.get('dataRegistroFinal')?.value;
    let isValidData = true;

    return {
      isValidData,
      dataRegistroInicial: dataRegistroInicialStr,
      dataRegistroFinal: dataRegistroFinalStr,
    };
  }

  validaProcessoSeiEtpAnalise(processoSeiEtpAnalise: string) {
    let processoSeiId = '';
    let anoSeiId = '';
    let isValidProcessosei = true;
    const regex = /^STJ\s\d+\/\d{4}$/;
    if (regex.test(processoSeiEtpAnalise)) {
      const processoSeiSplit = processoSeiEtpAnalise.split('/');
      processoSeiId = processoSeiSplit[0];
      anoSeiId = processoSeiSplit[1];
    }
    return { isValidProcessosei, processoSeiId, anoSeiId };
  }

  validaNumeroProcessoSeiEtpAnalise(numeroEtp: string) {
    let processoSeiId;
    let anoSeiId;
    let isValidProcessosei = true;
    if (numeroEtp) {
      if (numeroEtp.length !== 11) {
        isValidProcessosei = false;
      } else {
        processoSeiId = numeroEtp.substring(0, 6);
        anoSeiId = numeroEtp.substring(7);
      }
    }
    return { isValidProcessosei, processoSeiId, anoSeiId };
  }

  validaNumeroEtpEtpAnalise(numeroEtp: string) {
    let numeroEtpId;
    let anoEtpId;
    let isValideNumeroEtp = true;
    if (numeroEtp) {
      if (numeroEtp.length !== 9) {
        isValideNumeroEtp = false;
      } else {
        numeroEtpId = numeroEtp.substring(0, 4);
        anoEtpId = numeroEtp.substring(5);
      }
    }
    return { isValideNumeroEtp, numeroEtpId, anoEtpId };
  }

  getPesquisarEtpEtpAnalise(pageEvent?: any, lazyLoading: boolean = false) {
    let { isValidData, dataRegistroInicial, dataRegistroFinal } =
      this.validaDataPesquisaEtpAnalise();
    if (!isValidData) {
      this.alertUtils.alertDialog(
        `A data final deve ser maior do que a data inicial`
      );
      return;
    }

    let servidor = this.formControl['servidor']?.value;

    let processoSei = this.formControl['processoSei']?.value;
    let { isValidProcessosei, processoSeiId, anoSeiId } =
      this.validaNumeroProcessoSeiEtpAnalise(processoSei);
    if (!isValidProcessosei) {
      this.alertUtils.alertDialog(
        `O Formato do Número do Processo SEI deve ser por exemplo 999999/2025`
      );
      return;
    }

    let numeroEtpAnalise = this.formControl['numeroEtp']?.value;

    let { isValideNumeroEtp, numeroEtpId, anoEtpId } =
      this.validaNumeroEtpEtpAnalise(numeroEtpAnalise);
    if (!isValideNumeroEtp) {
      this.alertUtils.alertDialog(
        `O Formato do Número do ETP deve ser por exemplo 9999/2025`
      );
      return;
    }

    let formularioEtpAnalise = this.formControl['formularioEtp']?.value;

    let formularioEtpIdAnalise = new Array<number>();
    formularioEtpIdAnalise.push(formularioEtpAnalise?.id);

    let tipoLicitacaoEtp = this.formControl['tipoLicitacaoEtp']?.value;
    let tipoLicitacaoEtpId = new Array<number>();
    tipoLicitacaoEtpId.push(tipoLicitacaoEtp?.id);

    let situacaoAnalise = this.formControl['situacaoEtp']?.value;
    const situacaoListaAnalise = situacaoAnalise?.map((item: any) => item.id);

    let unidadeIdAnalise = this.formControl['unidadeId']?.value;
    const unidadeListaAnalise = unidadeIdAnalise?.map((item: any) => item.id);

    let etpEtapaAnalise = this.formControl['etpEtapa']?.value;
    const etpEtapaList = etpEtapaAnalise?.map((item: any) => item.id);

    const soMinhasAnalisesForm = this.formControl['soMinhasAnalises']?.value;

    const objParamsEtpAnalise = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      formulario: formularioEtpAnalise === null ? null : formularioEtpIdAnalise,
      tipoLicitacao: tipoLicitacaoEtp === null ? null : tipoLicitacaoEtpId,
      situacao: situacaoAnalise === null ? null : situacaoListaAnalise,
      descricaoFullText: this.descricao,
      numeroEtp: numeroEtpId,
      anoEtp: anoEtpId,
      anoProcessoSei: anoSeiId,
      numeroProcessoSei: processoSeiId,
      unidadeId: unidadeIdAnalise == null ? null : unidadeListaAnalise,
      etpEtapa: etpEtapaList,
      dataLimiteAnalistaInicialIso: dataRegistroInicial,
      dataEntradaInicialIso: dataRegistroInicial,
      dataEntradaFinalIso: dataRegistroFinal,
      dataLimiteAnalistaFinalIso: dataRegistroFinal,
      dataLimiteRevisorInicialIso: dataRegistroInicial,
      dataLimiteRevisorFinalIso: dataRegistroFinal,
      usuarioRegistro: servidor?.login,
      soMinhasAnalises: soMinhasAnalisesForm,
    };
    this.biblioteca.removeKeysNullable(objParamsEtpAnalise);
    this.gestaoEtpAnaliseService.getEtpAnalise(objParamsEtpAnalise).subscribe({
      next: (data: any) => {
        this.etpDelegadoListAnalise = data.content.filter(
          (etp: any) => etp.delegado === true
        );

        data.content = data.content.filter(
          (etp: any) => etp.delegado === false
        );

        if (lazyLoading) {
          this.pageEtpAnalise.content = this.montarAcoesPermitidasEtpAnalise(
            data.content || [],
            true
          );
          this.pageEtpAnalise.totalElements = data.totalElements;
        } else {
          this.pageEtpAnalise = data;
        }
      },
      error: (e: any) => {
        this.alertUtils.handleError(e);
      },
    });
  }

  get formControl() {
    return this.gestaoETPFiltroForm.controls;
  }

  limparCamposEtpAnalise() {
    this.gestaoETPFiltroForm.reset();
    this.descricao = '';
    this.inicializarSituacaoEtpAnalise();
    this.setaPeriodoDatasPadraoEtpAnalise();
  }

  completaNumeroEtpAnalise(event: any, seiEtp: string) {
    const inputValueAnalise = event.target.value;
    let seiEtpEditAnalise = undefined;
    if (inputValueAnalise) {
      if (inputValueAnalise.includes('/')) {
        const eventSplitAnalise = inputValueAnalise.split('/');
        seiEtpEditAnalise =
          eventSplitAnalise[0].padStart(4, '0') +
          '/' +
          (!eventSplitAnalise[1] ? '2025' : eventSplitAnalise[1]);
      } else {
        seiEtpEditAnalise = inputValueAnalise.padStart(4, '0') + '/' + '2025';
      }
      this.formControl[seiEtp]?.setValue(seiEtpEditAnalise);
    }
  }

  onSort({ coluna, direcao }: any) {
    this.pageEtpAnalise.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarEtpEtpAnalise(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarEtpEtpAnalise(objEtpAnalise: any) {
    const idEtpAnalise = objEtpAnalise?.id;
    const objetoEtpAnalise = {
      formulario: Number(objEtpAnalise?.formulario?.id),
      tipoLicitacao: Number(objEtpAnalise?.tipoLicitacao?.id),
      situacao: objEtpAnalise?.situacao?.id,
      descricao: objEtpAnalise?.descricao,
      etpPai: objEtpAnalise?.etpPai,
      versao: objEtpAnalise?.versao,
      ano: objEtpAnalise?.ano ? Number(objEtpAnalise?.ano) : null,
      etpNumeracao: objEtpAnalise?.etpNumeracao
        ? objEtpAnalise?.etpNumeracao
        : null,
      etapa: objEtpAnalise?.etapa ? Number(objEtpAnalise?.etapa) : null,
      processoSei: objEtpAnalise?.processoSei
        ? objEtpAnalise?.processoSei
        : null,
      unidadeId: objEtpAnalise?.unidadeId ? objEtpAnalise.unidadeId : null,
    };
    if (idEtpAnalise === undefined) {
      this.gestaoEtpAnaliseService.postEtpAnalise(objetoEtpAnalise).subscribe({
        next: (etp: any) => {
          this.CADASTRAR_ETP.close();
          this.alertUtils.handleSucess(
            this.mensagens.MSG_SALVO_SUCESSO_ANALISE
          );
          this.navegarEtpEtpAnalise(etp);
        },
        error: (e: any) => {
          this.CADASTRAR_ETP.close(true);
          this.tableLazyLoading();
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoEtpAnaliseService
        .putEtpAnalise(idEtpAnalise, objetoEtpAnalise)
        .subscribe({
          next: (etp: any) => {
            this.CADASTRAR_ETP.close();
            this.alertUtils.handleSucess(
              this.mensagens.MSG_ALTERADO_SUCESSO_ANALISE
            );
            this.navegarEtpEtpAnalise(etp);
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
    }
  }

  navegarEtpEtpAnalise(etp: any) {
    this.elaborarEtpEtpAnalise(etp);
  }

  excluirETPEtpAnalise(item: any) {
    let msg = `Deseja excluir o ETP?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpAnaliseService.deleteEtpAnalise(item.id).subscribe({
          next: (data: any) => {
            this.alertUtils.handleSucess(`Excluido com sucesso`);
            this.tableLazyLoading();
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
      }
    });
  }

  montarAcoesPermitidasEtpAnalise(item: [], todasVersoes: boolean): [] {
    if (!item) {
      return [];
    }
    item.forEach((etp: any) => {
      etp.acoesFormulario = this.construirAcoesEtpAnalise(etp, todasVersoes);
    });
    return item;
  }

  public construirAcoesEtpAnalise(etp: any, todasVersoes: boolean) {
    let retorno: MenuItem[] = [];
    if (etp.situacao.chave === 'ABERTO') {
      retorno.push({
        label: 'ETP',
        expanded: true,
        items: [
          {
            label: 'Elaboração',
            icon: 'fa-solid fa-gears',
            command: () =>
              this.elaborarEtpEtpAnalise(this.selectedRowDataAnalise),
          },
        ],
      });
    }
    retorno.push({
      label: 'Opções',
      expanded: true,
      items: this.construirItensEtpAnalise(etp, todasVersoes),
    });
    return retorno;
  }

  retornoEtpAnaliseTrocaSituacao(
    retornoEtpAnalise: MenuItem[],
    labelAnalise: string,
    iconAnalise: string,
    acaoAnalise: string
  ) {
    retornoEtpAnalise.push({
      label: labelAnalise,
      icon: iconAnalise,
      command: () =>
        this.trocarSituacaoEtpEtpAnalise(
          this.selectedRowDataAnalise,
          acaoAnalise
        ),
    });
    return retornoEtpAnalise;
  }

  public construirItensEtpAnalise(etpAnalise: any, todasVersoes: boolean) {
    let retornoEtpAnalise: MenuItem[] = [];

    retornoEtpAnalise.push({
      label: 'Visualizar',
      icon: 'fa-solid fa-eye',
      command: () =>
        this.elaborarEtpEtpAnalise(this.selectedRowDataAnalise, true),
    });

    if (etpAnalise.acoesFormulario.includes('EDITAR')) {
      retornoEtpAnalise.push({
        label: 'Editar',
        icon: 'fa-solid fa-file-pen',
        command: () => this.editarETPEtpAnalise(this.selectedRowDataAnalise),
      });
    }

    if (etpAnalise.acoesFormulario.includes('EXCLUIR')) {
      retornoEtpAnalise.push({
        label: 'Excluir',
        icon: 'fa-solid fa-trash',
        command: () => this.excluirETPEtpAnalise(this.selectedRowDataAnalise),
      });
    }

    const acoesTrocaSituacaoAnalise = [
      { acao: 'REABRIR', label: 'Reabrir', icon: 'fa-lg fas fa-unlock' },
      { acao: 'FECHAR', label: 'Fechar', icon: 'fa-lg fas fa-lock' },
      { acao: 'CANCELAR', label: 'Cancelar', icon: 'fa-lg fas fa-ban' },
      { acao: 'PUBLICAR', label: 'Publicar', icon: 'fa-lg fas fa-paper-plane' },
      {
        acao: 'SUSPENDER',
        label: 'Suspender',
        icon: 'fa-lg fas fa-circle-pause',
      },
    ];

    acoesTrocaSituacaoAnalise.forEach(({ acao, label, icon }) => {
      if (etpAnalise.acoesFormulario.includes(acao)) {
        retornoEtpAnalise = this.retornoEtpAnaliseTrocaSituacao(
          retornoEtpAnalise,
          label,
          icon,
          acao
        );
      }
    });

    if (etpAnalise.acoesFormulario.includes('VERSIONAR')) {
      retornoEtpAnalise.push({
        label: 'Versionar',
        icon: 'fa-lg fas fa-square-plus',
        command: () => this.versionarEtpEtpAnalise(this.selectedRowDataAnalise),
      });
    }

    if (todasVersoes && etpAnalise.versao != 1) {
      retornoEtpAnalise.push({
        label: 'Versões',
        icon: 'fa-solid fa-code-branch',
        command: () =>
          this.getTodasVersoesEtpEtpAnalise(
            this.selectedRowDataAnalise,
            this.pageEtpAnalise
          ),
      });
    }

    return retornoEtpAnalise;
  }

  acaoPermitidaEtpAnalise(item: any, acao: string): boolean {
    return item.acoesFormulario.includes(acao);
  }

  trocarSituacaoEtpEtpAnalise(obj: any, acao: any) {
    const id = obj?.id;
    const objFormulario = Object.values(AcoesEnum).find(
      (value) => value === acao
    );
    let msg = `
    Deseja ${objFormulario?.toLowerCase()} o ETP?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpAnaliseService
          .patchEtpAnalise(id, objFormulario)
          .subscribe({
            next: () => {
              this.alertUtils.handleSucess(
                `Ação ` +
                  objFormulario?.toLowerCase() +
                  ` realizada com sucesso`
              );
              this.tableLazyLoading();
            },
            error: (e: any) => {
              this.alertUtils.toastrErrorMsg(e);
            },
          });
      }
    });
  }

  versionarEtpEtpAnalise(item: any) {
    let msg = `
    Deseja criar uma versão com base no ETP - ${item.descricao}?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.VERSIONAR_ETP.open(item);
      }
    });
  }

  executaVersionarEtpAnalise(item: any) {
    this.gestaoEtpAnaliseService
      .versionarEtpAnalise(item.id, item.motivo)
      .subscribe({
        next: () => {
          this.alertUtils.handleSucess(`Versão gerada com sucesso`);
          this.tableLazyLoading();
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  getTodasVersoesEtpEtpAnalise(item: any, pageEvent?: any) {
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoEtpAnaliseService
      .getTodasVersoesEtp(item.id, objParams)
      .subscribe({
        next: (data: any) => {
          let versoes = this.montarAcoesPermitidasEtpAnalise(
            data.content || [],
            false
          );
          let totalElements = data.totalElements;
          this.VERSOES_ETP.open(
            versoes,
            totalElements,
            this.selectedRowDataAnalise.descricao
          );
        },
        error: (e: any) => {
          this.alertUtils.handleError(e);
        },
      });
  }

  selecionaItemEtpAnalise(event: Event, item: any) {
    event.stopPropagation();
    this.selectedRowDataAnalise = item;
  }

  public async pesquisaProcessoEtpAnalise(event: any) {
    const processoSei = event.target.value;
    await this.seiService.pesquisaProcesso(processoSei).then((data) => {
      this.formControl['processoSei'].setValue(data?.procedimentoFormatado);
      if (!data?.procedimentoFormatado) {
        this.alertUtils.alertDialog(
          `O número do processo SEI ${processoSei} não existe!`
        );
      }
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
                  this.tableLazyLoading();
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
                this.tableLazyLoading();
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

  removerAnalistaFichaAnalise(event: any) {
    this.fichaAnaliseAnalistasService
      .deleteFichaAnaliseAnalistas(event)
      .subscribe({
        next: () => {
          this.alertUtils.handleSucess(`Analista removido com sucesso`);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  private abrirFichaAnalise(itemEtpAnalise: any) {
    itemEtpAnalise.tipoContratacao = itemEtpAnalise.tipoLicitacao.descricao;
    itemEtpAnalise.numeroEtp =
      itemEtpAnalise.etpNumeracao + '/' + itemEtpAnalise.ano;
    this.fichaAnaliseService
      .getFichaAnalisePorEtp(itemEtpAnalise.id)
      .subscribe({
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
                    itemEtpAnalise,
                    this.situacaoList,
                    this.unidadesList,
                    itemEtpAnalise,

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
              this.etapaList,
              this.situacaoList,
              this.unidadesList,
              itemEtpAnalise,
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

  setaPeriodoDatasPadraoEtpAnalise() {
    const hojeAnalise = new Date();

    const dataInicialAnalise = new Date(hojeAnalise);
    dataInicialAnalise.setDate(hojeAnalise.getDate() - 360);
    dataInicialAnalise.setHours(0, 0, 0, 0);

    const dataFinalAnalise = new Date(hojeAnalise);
    dataFinalAnalise.setHours(23, 59, 0, 0);

    this.gestaoETPFiltroForm
      .get('dataRegistroInicial')
      ?.setValue(dataInicialAnalise.toISOString().substring(0, 10));
    this.gestaoETPFiltroForm
      .get('dataRegistroFinal')
      ?.setValue(dataFinalAnalise.toISOString().substring(0, 10));
  }
}
