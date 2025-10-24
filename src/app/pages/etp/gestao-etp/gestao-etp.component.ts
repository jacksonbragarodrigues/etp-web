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
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { Sarhclientservice } from 'src/app/services/sarhclient.service';
import { SeiService } from 'src/app/services/sei.service';
import { AcoesEnum } from 'src/app/shared/models/acoes.enum';
import { AlertUtils } from '../../../../utils/alerts.util';
import { BibliotecaUtils } from '../../../../utils/biblioteca.utils';
import { SituacaoFormularioServiceService } from '../../../services/situacao-formulario-service.service';
import { TabelaSortableHeader } from '../../../shared/tables/table-sortable';
import GestaoBase from '../../shared/gestao-base';
import { CadastrarEtpComponent } from './modal/cadastrar-etp/cadastrar-etp.component';
import { FormularioEtpComponent } from './modal/formulario-etp/formulario-etp.component';
import { VersionarComponent } from './modal/versionar/versionar.component';
import { VersoesEtpComponent } from './modal/versoes-etp/versoes-etp.component';

@Component({
  selector: 'app-gestao-etp',
  templateUrl: './gestao-etp.component.html',
  styleUrl: './gestao-etp.component.scss',
})
export class GestaoEtpComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_etp', { static: true })
  CADASTRAR_ETP!: CadastrarEtpComponent;

  @ViewChild('versionar_etp', { static: true })
  VERSIONAR_ETP!: VersionarComponent;

  @ViewChild('formulario_etp', { static: true })
  CONSTRUI_FORMULARIO!: FormularioEtpComponent;

  @ViewChild('versoes_etp', { static: true })
  VERSOES_ETP!: VersoesEtpComponent;

  @ViewChild('menu') menu: Menu | undefined;

  selectedRowData: any | null = null;
  gestaoETPFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();
  gestaoBase: GestaoBase = new GestaoBase();

  public toggleForm = false;
  public descricao: string = '';

  selectedTipoPesquisa = 'ANY_MATCH';
  optionsTipoPesquisa = [
    { value: 'ANY_MATCH', label: 'Qualquer uma destas palavras' },
    { value: 'EXACT_PHRASE', label: 'Esta expressão ou frase exata' },
  ];

  mensagens = {
    MSG_ALTERADO_SUCESSO: 'Alterado com sucesso',
    MSG_SALVO_SUCESSO: 'Salvo com sucesso',
  };

  desabilitarCampos = false;
  etpDelegadoList: any[] = [];
  formularios: any[] = [];
  etpTipoLicitacaoList: any[] = [];
  situacaoList: any[] = [];
  etapaList: any[] = [];
  unidadesList: any[] = [];
  servidoresList: any[] = [];
  unidadeUsuarioLogado: any;
  private lazyLoading: boolean = true;
  timersBloqueio = new Map();

  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private gestaoEtpService: GestaoEtpService,
    private gestaoFormularioService: GestaoFormularioService,
    private etpTipoLicitacaoService: EtpTipoLicitacaoService,
    private situacaoFormularioService: SituacaoFormularioServiceService,
    private etpEtapaService: EtpEtapaService,
    private sarhclientservice: Sarhclientservice,
    private seiService: SeiService,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    this.iniciaPage();
    await this.getEtapas();
    await this.getSituacaoFormulario();

    this.getTodosFormularios();
    this.getEtpTipoLicitacao();

    this.getUnidades();
    this.getServidorses();
    this.getDadosUnidadeServidorLogado();
    this.limparCampos();
    this.tableLazyLoading();
  }

  bloquearEtp(dadosInformados: any) {
    this.cancelTimer(dadosInformados?.id);
    const id = dadosInformados?.id;
    const objFormulario = {
      bloqueado: dadosInformados.bloqueado,
    };
    this.gestaoEtpService.putBloqueioEtp(id, objFormulario).subscribe({
      next: () => {},
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  executarAposMinutos(idEtp: any) {
    this.cancelTimer(idEtp);
    const timerBloquio = setTimeout(async () => {
      await lastValueFrom(
        this.gestaoEtpService.putBloqueioEtp(idEtp, {
          bloqueado: false,
        })
      );
    }, getEnvironment().bloqueioTimeOut * 60 * 1000);
    this.timersBloqueio.set(idEtp, timerBloquio);
  }

  cancelTimer(id: any) {
    if (this.timersBloqueio.has(id)) {
      clearTimeout(this.timersBloqueio.get(id));
      this.timersBloqueio.delete(id);
    }
  }

  limparFiltrosAvancados(event: any) {
    this.gestaoETPFiltroForm.get('unidadeId')?.setValue(null);
    this.gestaoETPFiltroForm.get('servidor')?.setValue(null);
  }

  iniciaPage() {
    this.page = {
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: this.page.totalElements,
      totalPages: Math.ceil(this.page.totalElements / this.page.size),
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
    });

    this.inicializarSituacao();
  }

  completaNumeroProcessoSei(event: any, seiEtp: string) {
    const inputValueProcessoSei = event.target.value;
    let processoSeiEtpEdit = undefined;
    if (inputValueProcessoSei) {
      if (inputValueProcessoSei.includes('/')) {
        const eventSplit = inputValueProcessoSei.split('/');
        processoSeiEtpEdit =
          eventSplit[0].padStart(6, '0') +
          '/' +
          (!eventSplit[1] ? '2025' : eventSplit[1]);
      } else {
        processoSeiEtpEdit =
          inputValueProcessoSei.padStart(6, '0') + '/' + '2025';
      }
      this.formControl[seiEtp]?.setValue(processoSeiEtpEdit);
    }
  }

  completaNumeroEtp(event: any, seiEtp: string) {
    const inputValue = event.target.value;
    let seiEtpEdit = undefined;
    if (inputValue) {
      if (inputValue.includes('/')) {
        const eventSplit = inputValue.split('/');
        seiEtpEdit =
          eventSplit[0].padStart(4, '0') +
          '/' +
          (!eventSplit[1] ? '2025' : eventSplit[1]);
      } else {
        seiEtpEdit = inputValue.padStart(4, '0') + '/' + '2025';
      }
      this.formControl[seiEtp]?.setValue(seiEtpEdit);
    }
  }

  getTodosFormularios() {
    this.gestaoFormularioService
      .getFormulariosPublicados()
      .subscribe((formulariosList) => {
        this.formularios = formulariosList;
      });
  }

  async getSituacaoFormulario() {
    this.situacaoList = await firstValueFrom(
      this.situacaoFormularioService.getSituacaoFormulario()
    );

    this.inicializarSituacao();
  }

  inicializarSituacao() {
    const situacoesDefault = ['ABERTO', 'PUBLICADO', 'FECHADO', 'MINUTA'];
    const situacoesPadrao = this.situacaoList.filter((s: any) =>
      situacoesDefault.includes(s.chave)
    );

    const etapasDefault = [
      'INICIAL',
      'ELABORACAO',
      'ENVIADO_SEI',
      'VERSIONADO',
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
      },
      { emitEvent: true }
    );
  }

  getEtpTipoLicitacao() {
    this.etpTipoLicitacaoService
      .getEtpTipoLicitacaoLista()
      .subscribe((tipoLicitacaoList) => {
        this.etpTipoLicitacaoList = tipoLicitacaoList;
      });
  }

  async getEtapas() {
    this.etapaList = await firstValueFrom(
      this.etpEtapaService.getEtpEtapaLista()
    );

    this.etapaList = this.etapaList.filter((etapa) =>
      [
        'INICIAL',
        'ELABORACAO',
        'ENVIADO_SEI',
        'AGUARDANDO_ANALISE',
        'AGUARDANDO_REVISAO',
        'AGUARDANDO_RETORNO_ANALISE',
        'ANALISADO',
        'VERSIONADO',
      ].includes(etapa.chave)
    );
  }

  getUnidades() {
    this.sarhclientservice.getListaUnidades().subscribe((unidadesList) => {
      this.unidadesList = unidadesList;
    });
  }

  getServidorses() {
    this.gestaoEtpService
      .consultarDadosServidorPorLoginEtp()
      .subscribe((servidoresList) => {
        this.servidoresList = servidoresList;
      });
  }

  getDadosUnidadeServidorLogado() {
    this.gestaoEtpService
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

  cadastrarETP() {
    this.CADASTRAR_ETP.open(
      null,
      this.formularios,
      this.etpTipoLicitacaoList,
      this.situacaoList,
      this.etapaList,
      [],
      this.unidadeUsuarioLogado
    );
  }

  editarETP(item: any) {
    this.CADASTRAR_ETP.open(
      item,
      this.formularios,
      this.etpTipoLicitacaoList,
      this.situacaoList,
      this.etapaList,
      this.unidadesList,
      this.unidadeUsuarioLogado
    );
  }

  garvarDadosFormularioEtp(dadosFormularioEtp: any) {
    const id = dadosFormularioEtp?.id;
    const objFormulario = {
      jsonDados: dadosFormularioEtp?.jsonDados,
    };
    this.gestaoEtpService.putEtp(id, objFormulario).subscribe({
      next: () => {},
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  garvarDadosFormularioEtpNext(dadosFormularioEtp: any) {
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

  atualizarFormularioEtp(etp: any) {
    const id = etp?.id;
    const idFormulario = etp?.idFormulario;
    this.gestaoEtpService.patchFormularioEtp(id, idFormulario).subscribe({
      next: () => {},
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  async etpBloqueado(id: any) {
    const data: any = await lastValueFrom(this.gestaoEtpService.getEtpById(id));
    return data;
  }

  async pegarUsuarioLogado() {
    return await firstValueFrom(this.authService.dadosUsuarioLogado);
  }

  async elaborarEtp(
    item: any,
    visualizar: boolean = false,
    etpDelegado = false
  ) {
    const tipoPermissaoDelegacao = item.tipoPermissaoDelegacao;
    const dadosBloqueio = await this.etpBloqueado(item?.id);
    const dadosUsuario = await this.pegarUsuarioLogado();
    const usuario = `${dadosUsuario?.login} - ${dadosUsuario?.nome}`;
    if (dadosBloqueio?.bloqueado && dadosBloqueio?.bloqueadoPor !== usuario) {
      this.alertUtils.alertDialog(
        `O etp está bloqueado por ${dadosBloqueio?.bloqueadoPor}`
      );
      return;
    }
    await lastValueFrom(
      this.gestaoEtpService.putBloqueioEtp(item?.id, {
        bloqueado: true,
      })
    );
    this.executarAposMinutos(item?.id);
    this.gestaoEtpService.getEtpById(item?.id).subscribe({
      next: (data: any) => {
        item = data;
        item.tipoPermissaoDelegacao = tipoPermissaoDelegacao;
        if (
          item.situacao?.chave === 'PUBLICADO' ||
          item.situacao?.chave === 'FECHADO'
        ) {
          visualizar = true;
        }
        const objConstrutorFormulario = {
          id: item?.id,
          versao: item?.versao,
          idFormulario: item?.formulario?.id,
          jsonForm: item?.formulario?.jsonForm,
          jsonDados: item?.jsonDados,
          tipoContratacao: item?.tipoLicitacao?.descricao,
          tipoContratacaoId: item?.tipoLicitacao?.id,
          tipoContratacaoChave: item?.tipoLicitacao?.chave,
          descricao: item?.descricao,
          processoSei:
            item.numeroProcessoSei !== null
              ? item.numeroProcessoSei + '/' + item.anoProcessoSei
              : '',
          numeroEtp:
            item.etpNumeracao !== null
              ? item.etpNumeracao + '/' + item.ano
              : '',
          etpNumeracaoTermoOrientacao:
            item.etpNumeracaoTermoOrientacao !== null
              ? item.etpNumeracaoTermoOrientacao + '/' + item.ano
              : '',
          visualizar: visualizar,
          situacao: item.situacao,
          unidadeId: item.unidadeId,
          unidadeUsuarioLogado: this.unidadeUsuarioLogado,
        };
        this.CONSTRUI_FORMULARIO.open({
          etp: objConstrutorFormulario,
          item: item,
          formularioList: this.formularios,
          tipoLicitacaoList: this.etpTipoLicitacaoList,
          situacaoList: this.situacaoList,
          etapaList: this.etapaList,
          unidadeList: this.unidadesList,
          etpDelegado: etpDelegado,
        });
      },
    });
  }

  tableLazyLoading() {
    this.page.content = [];
    this.selectedRowData = null;
    this.getPesquisarEtp(this.page, this.lazyLoading);
  }

  validaData(dataInicial: Date, dataFinal: Date) {
    if (dataInicial > dataFinal) {
      return false;
    }
    return true;
  }

  validaDataPesquisa() {
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

  validaProcessoSei(processoSei: string) {
    let processoSeiId = '';
    let anoSeiId = '';
    let isValidProcessosei = true;
    const regex = /^STJ\s\d+\/\d{4}$/;
    if (regex.test(processoSei)) {
      const processoSeiSplit = processoSei.split('/');
      processoSeiId = processoSeiSplit[0];
      anoSeiId = processoSeiSplit[1];
    }
    return { isValidProcessosei, processoSeiId, anoSeiId };
  }

  validaNumeroProcessoSei(numeroEtp: string) {
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

  validaNumeroEtp(numeroEtp: string) {
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

  getPesquisarEtp(pageEvent?: any, lazyLoading: boolean = false) {
    let { isValidData, dataRegistroInicial, dataRegistroFinal } =
      this.validaDataPesquisa();
    if (!isValidData) {
      this.alertUtils.alertDialog(
        `A data final deve ser maior do que a data inicial`
      );
      return;
    }

    let servidor = this.formControl['servidor']?.value;

    let processoSei = this.formControl['processoSei']?.value;
    let { isValidProcessosei, processoSeiId, anoSeiId } =
      this.validaNumeroProcessoSei(processoSei);
    if (!isValidProcessosei) {
      this.alertUtils.alertDialog(
        `O Formato do Número do Processo SEI deve ser por exemplo 999999/2025`
      );
      return;
    }

    let numeroEtp = this.formControl['numeroEtp']?.value;
    let { isValideNumeroEtp, numeroEtpId, anoEtpId } =
      this.validaNumeroEtp(numeroEtp);
    if (!isValideNumeroEtp) {
      this.alertUtils.alertDialog(
        `O Formato do Número do ETP deve ser por exemplo 9999/2025`
      );
      return;
    }
    let formularioEtp = this.formControl['formularioEtp']?.value;

    let formularioEtpId = new Array<number>();
    formularioEtpId.push(formularioEtp?.id);

    let tipoLicitacaoEtp = this.formControl['tipoLicitacaoEtp']?.value;
    let tipoLicitacaoEtpId = new Array<number>();
    tipoLicitacaoEtpId.push(tipoLicitacaoEtp?.id);

    let situacao = this.formControl['situacaoEtp']?.value;
    const situacaoLista = situacao?.map((item: any) => item.id);

    let etpEtapa = this.formControl['etpEtapa']?.value;
    const etpEtapaList = etpEtapa?.map((item: any) => item.id);

    let unidadeId = this.formControl['unidadeId']?.value;
    const unidadeLista = unidadeId?.map((item: any) => item.id);

    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      formulario: formularioEtp === null ? null : formularioEtpId,
      tipoLicitacao: tipoLicitacaoEtp === null ? null : tipoLicitacaoEtpId,
      situacao: situacao === null ? null : situacaoLista,
      descricaoFullText: this.descricao,
      numeroEtp: numeroEtpId,
      anoEtp: anoEtpId,
      anoProcessoSei: anoSeiId,
      numeroProcessoSei: processoSeiId,
      unidadeId: unidadeId == null ? null : unidadeLista,
      etpEtapa: etpEtapaList,
      dataRegistroInicialIso: dataRegistroInicial,
      dataRegistroFinalIso: dataRegistroFinal,
      usuarioRegistro: servidor?.login,
      tipoPesquisa: this.selectedTipoPesquisa,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoEtpService.getEtp(objParams).subscribe({
      next: (data: any) => {
        this.etpDelegadoList = data.content.filter(
          (etp: any) => etp.delegado === true
        );

        data.content = data.content.filter(
          (etp: any) => etp.delegado === false
        );

        if (lazyLoading) {
          this.page.content = this.montarAcoesPermitidas(
            data.content || [],
            true
          );
          this.page.totalElements = data.totalElements;
        } else {
          this.page = data;
        }
      },
      error: (e: any) => {
        this.alertUtils.handleError(e);
      },
    });
  }

  emitFullText(valueFlag: boolean) {
    if (valueFlag) {
      this.tableLazyLoading();
    }
  }

  get formControl() {
    return this.gestaoETPFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoETPFiltroForm.reset();
    this.descricao = '';
    this.inicializarSituacao();
    this.setaPeriodoDatasPadrao();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarEtp(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarEtp(obj: any) {
    const id = obj?.id;
    const objEtp = {
      formulario: Number(obj?.formulario?.id),
      tipoLicitacao: Number(obj?.tipoLicitacao?.id),
      situacao: obj?.situacao?.id,
      descricao: obj?.descricao,
      etpPai: obj?.etpPai,
      versao: obj?.versao,
      ano: obj?.ano ? Number(obj?.ano) : null,
      etpNumeracao: obj?.etpNumeracao ? obj?.etpNumeracao : null,
      etapa: obj?.etapa ? Number(obj?.etapa) : null,
      processoSei: obj?.processoSei ? obj?.processoSei : null,
      unidadeId: obj?.unidadeId ? obj.unidadeId : null,
    };
    if (id === undefined) {
      this.gestaoEtpService.postEtp(objEtp).subscribe({
        next: (etp: any) => {
          this.CADASTRAR_ETP.close();
          this.alertUtils.handleSucess(this.mensagens.MSG_SALVO_SUCESSO);
          this.navegarEtp(etp);
        },
        error: (e: any) => {
          this.CADASTRAR_ETP.close(true);
          this.tableLazyLoading();
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoEtpService.putEtp(id, objEtp).subscribe({
        next: (etp: any) => {
          this.CADASTRAR_ETP.close();
          this.alertUtils.handleSucess(this.mensagens.MSG_ALTERADO_SUCESSO);
          this.navegarEtp(etp);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  navegarEtp(etp: any) {
    this.elaborarEtp(etp);
  }

  excluirETP(item: any) {
    let msg = `Deseja excluir o ETP?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpService.deleteEtp(item.id).subscribe({
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

  montarAcoesPermitidas(item: [], todasVersoes: boolean): [] {
    if (!item) {
      return [];
    }
    item.forEach((etp: any) => {
      etp.acoesFormulario = this.construirAcoes(etp, todasVersoes);
    });
    return item;
  }

  private construirAcoes(etp: any, todasVersoes: boolean) {
    let retorno: MenuItem[] = [];
    if (etp.situacao.chave === 'ABERTO') {
      retorno.push({
        label: 'ETP',
        expanded: true,
        items: [
          {
            label: 'Elaboração',
            icon: 'fa-solid fa-gears',
            command: () => this.elaborarEtp(this.selectedRowData),
          },
        ],
      });
    }
    retorno.push({
      label: 'Opções',
      expanded: true,
      items: this.construirItens(etp, todasVersoes),
    });
    return retorno;
  }

  retornoEtpTrocaSituacao(
    retornoEtp: MenuItem[],
    label: string,
    icon: string,
    acao: string
  ) {
    retornoEtp.push({
      label: label,
      icon: icon,
      command: () => this.trocarSituacaoEtp(this.selectedRowData, acao),
    });
    return retornoEtp;
  }

  private construirItens(etp: any, todasVersoes: boolean) {
    let retorno: MenuItem[] = [];

    retorno.push({
      label: 'Visualizar',
      icon: 'fa-solid fa-eye',
      command: () => this.elaborarEtp(this.selectedRowData, true),
    });

    if (etp.acoesFormulario.includes('EDITAR')) {
      retorno.push({
        label: 'Editar',
        icon: 'fa-solid fa-file-pen',
        command: () => this.editarETP(this.selectedRowData),
      });
    }

    if (etp.acoesFormulario.includes('EXCLUIR')) {
      retorno.push({
        label: 'Excluir',
        icon: 'fa-solid fa-trash',
        command: () => this.excluirETP(this.selectedRowData),
      });
    }

    const acoesTrocaSituacao = [
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

    acoesTrocaSituacao.forEach(({ acao, label, icon }) => {
      if (etp.acoesFormulario.includes(acao)) {
        retorno = this.retornoEtpTrocaSituacao(retorno, label, icon, acao);
      }
    });

    if (etp.acoesFormulario.includes('VERSIONAR')) {
      retorno.push({
        label: 'Versionar',
        icon: 'fa-lg fas fa-square-plus',
        command: () => this.versionarEtp(this.selectedRowData),
      });
    }

    if (todasVersoes && etp.versao != 1) {
      retorno.push({
        label: 'Versões',
        icon: 'fa-solid fa-code-branch',
        command: () => this.getTodasVersoesEtp(this.selectedRowData, this.page),
      });
    }

    return retorno;
  }

  acaoPermitida(item: any, acao: string): boolean {
    return item.acoesFormulario.includes(acao);
  }

  getDataModificacao(item: any) {
    return item?.dataAlteracao != null
      ? item?.dataAlteracao
      : item?.dataRegistro;
  }

  getUsuarioModificacao(item: any) {
    return item?.dataAlteracao != null
      ? item?.usuarioAlteracao
      : item?.usuarioRegistro;
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
          next: () => {
            this.alertUtils.handleSucess(
              `Ação ` + objFormulario?.toLowerCase() + ` realizada com sucesso`
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

  versionarEtp(item: any) {
    let msg = `
    Deseja criar uma versão com base no ETP - ${item.descricao}?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.VERSIONAR_ETP.open(item);
      }
    });
  }

  executaVersionar(item: any) {
    this.gestaoEtpService.versionarEtp(item.id, item.motivo).subscribe({
      next: () => {
        this.alertUtils.handleSucess(`Versão gerada com sucesso`);
        this.tableLazyLoading();
      },
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  getTodasVersoesEtp(item: any, pageEvent?: any) {
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoEtpService.getTodasVersoesEtp(item.id, objParams).subscribe({
      next: (data: any) => {
        let versoes = this.montarAcoesPermitidas(data.content || [], false);
        let totalElements = data.totalElements;
        this.VERSOES_ETP.open(
          versoes,
          totalElements,
          this.selectedRowData.descricao
        );
      },
      error: (e: any) => {
        this.alertUtils.handleError(e);
      },
    });
  }

  selecionaItem(event: Event, item: any) {
    event.stopPropagation();
    this.selectedRowData = item;
  }

  public async pesquisaProcesso(event: any) {
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

  setaPeriodoDatasPadrao() {
    const hoje = new Date();

    const dataInicial = new Date(hoje);
    dataInicial.setDate(hoje.getDate() - 360);
    dataInicial.setHours(0, 0, 0, 0);

    const dataFinal = new Date(hoje);
    dataFinal.setHours(23, 59, 0, 0);

    this.gestaoETPFiltroForm
      .get('dataRegistroInicial')
      ?.setValue(dataInicial.toISOString().substring(0, 10));
    this.gestaoETPFiltroForm
      .get('dataRegistroFinal')
      ?.setValue(dataFinal.toISOString().substring(0, 10));
  }
}
