import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { AlertUtils } from '../../../../utils/alerts.util';
import { BibliotecaUtils } from '../../../../utils/biblioteca.utils';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Page } from '@administrativo/components';
import { GestaoFormularioService } from '../../../services/gestao-formulario.service';
import { ModalCadastrarFormularioComponent } from '../modal/modal-cadastrar-formulario/modal-cadastrar-formulario.component';
import { AssuntoFormularioServiceService } from '../../../services/assunto-formulario-service.service';
import { SituacaoFormularioServiceService } from '../../../services/situacao-formulario-service.service';
import { TabelaSortableHeader } from '../../../shared/tables/table-sortable';
import { AcoesEnum } from 'src/app/shared/models/acoes.enum';
import { ModalConstruirFormularioComponent } from '../modal/modal-construir-formulario/modal-construir-formulario.component';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { getEnvironment } from 'src/app/app.component';
import { AuthService } from '@administrativo/core';
import { MenuItem } from 'primeng/api';
import { ModalVersoesFormularioComponent } from '../modal/modal-versoes-formulario/modal-versoes-formulario.component';
import GestaoBase from '../../shared/gestao-base';
import { VersionarFormularioComponent } from '../modal/versionar-formulario/versionar-formulario.component';

@Component({
  selector: 'app-gestao-formulario',
  templateUrl: './gestao-formulario.component.html',
  styleUrls: ['./gestao-formulario.component.scss'],
})
export class GestaoFormularioComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_formulario', { static: false })
  CADASTRAR_FORMULARIO!: ModalCadastrarFormularioComponent;

  @ViewChild('versionar_formulario', { static: true })
  VERSIONAR_FORMULARIO!: VersionarFormularioComponent;

  @ViewChild('construir_formulario', { static: false })
  CONSTRUI_FORMULARIO!: ModalConstruirFormularioComponent;

  @ViewChild('versoes_formulario', { static: false })
  VERSOES_FORMULARIO!: ModalVersoesFormularioComponent;

  selectedRowData: any | null = null;
  gestaoFormularioFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();
  gestaoBase: GestaoBase = new GestaoBase();

  mensagens = {
    MSG_FORMULARIO_ALTERADO: 'Alterado com sucesso',
    MSG_FORMULARIO_SALVO: 'Salvo com sucesso',
    ORIGEM_CADASTRO: 'CAD',
    ORIGEM_SCRIPT: 'SCR',
  };

  assuntoList: any[] = [];
  situacaoList: any[] = [];
  private lazyLoading: boolean = true;
  timersBloqueio = new Map();

  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private gestaoFormularioService: GestaoFormularioService,
    private assuntoFormularioService: AssuntoFormularioServiceService,
    private situacaoFormularioService: SituacaoFormularioServiceService,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    this.iniciaPage();
    await this.getSituacaoFormulario();
    this.tableLazyLoading();

    this.getAssuntoFormulario();
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

    this.gestaoFormularioFiltroForm = this.formBuilder.group({
      assuntoFormulario: null,
      situacaoFormulario: null,
      todasVersoes: false,
    });
  }

  async getSituacaoFormulario() {
    this.situacaoList = await firstValueFrom(
      this.situacaoFormularioService.getSituacaoFormulario()
    );

    this.inicializarSituacao();
  }

  inicializarSituacao() {
    const situacoesDefault = ['Aberto', 'Publicado', 'Fechado'];
    const situacoesPadrao = this.situacaoList.filter((s: any) =>
      situacoesDefault.includes(s.descricao)
    );

    this.gestaoFormularioFiltroForm.patchValue(
      {
        situacaoFormulario: situacoesPadrao,
      },
      { emitEvent: true }
    );
  }

  getAssuntoFormulario() {
    this.assuntoFormularioService
      .getAssuntoFormulario()
      .subscribe((assuntoList) => {
        this.assuntoList = assuntoList;
      });
  }

  cadastrarFormulario() {
    this.CADASTRAR_FORMULARIO.open(null, this.assuntoList, this.situacaoList);
  }

  editarFormulario(item: any) {
    this.CADASTRAR_FORMULARIO.open(item, this.assuntoList, this.situacaoList);
  }

  async pegarUsuarioLogado() {
    return await firstValueFrom(this.authService.dadosUsuarioLogado);
  }

  async construirformulario(item: any, visualizar: boolean = false) {
    const dadosBloqueio = await this.formularioBloqueado(item?.id);
    const dadosUsuario = await this.pegarUsuarioLogado();
    const usuario = `${dadosUsuario?.login} - ${dadosUsuario?.nome}`;
    if (dadosBloqueio?.bloqueado && dadosBloqueio?.bloqueadoPor !== usuario) {
      this.alertUtils.alertDialog(
        `O formulário está bloqueado por ${dadosBloqueio?.bloqueadoPor}`
      );
      return;
    }
    await lastValueFrom(
      this.gestaoFormularioService.putBloqueioFormulario(item?.id, {
        bloqueado: true,
      })
    );
    this.executarAposMinutos(item?.id);
    if (
      item?.situacao?.chave === 'PUBLICADO' ||
      item?.situacao?.chave === 'FECHADO'
    ) {
      visualizar = true;
    }

    const objConstrutorFormulario = {
      id: item?.id,
      idPai: item?.idPai,
      jsonForm: item?.jsonForm,
      jsonDados: item?.jsonDados,
      descricao: item?.descricao,
      assunto: item?.assunto?.descricao,
      assuntoId: item?.assunto?.id,
      versao: item?.versao,
      visualizar: visualizar,
      situacao: item?.situacao,
    };
    this.CONSTRUI_FORMULARIO.open(objConstrutorFormulario);
  }

  executarAposMinutos(idFormulario: any) {
    this.cancelTimer(idFormulario);
    const timerBloquio = setTimeout(async () => {
      await lastValueFrom(
        this.gestaoFormularioService.putBloqueioFormulario(idFormulario, {
          bloqueado: false,
        })
      );
    }, getEnvironment().bloqueioTimeOut * 60 * 1000);
    this.timersBloqueio.set(idFormulario, timerBloquio);
  }

  cancelTimer(id: any) {
    if (this.timersBloqueio.has(id)) {
      clearTimeout(this.timersBloqueio.get(id));
      this.timersBloqueio.delete(id);
    }
  }

  gravarDadosFormulario(objScriptFormulario: any) {
    const id = objScriptFormulario?.id;
    const objFormulario = {
      jsonForm: objScriptFormulario?.jsonForm,
      jsonDados: objScriptFormulario?.jsonDados,
    };
    this.gestaoFormularioService
      .putFormularioJson(id, objFormulario)
      .subscribe({
        next: () => {
          this.alertUtils.handleSucess(this.mensagens.MSG_FORMULARIO_SALVO);
          this.tableLazyLoading();
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  bloquearFormulario(dadosInformados: any) {
    this.cancelTimer(dadosInformados?.id);
    const id = dadosInformados?.id;
    const objFormulario = {
      bloqueado: dadosInformados.bloqueado,
    };
    this.gestaoFormularioService
      .putBloqueioFormulario(id, objFormulario)
      .subscribe({
        next: () => {},
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  async formularioBloqueado(id: any) {
    const data: any = await lastValueFrom(
      this.gestaoFormularioService.getFormularioById(id)
    );
    return data;
  }

  garvarDadosInformados(dadosInformados: any) {
    const id = dadosInformados?.id;
    const objFormulario = {
      jsonForm: null,
      jsonDados: dadosInformados?.jsonDados,
    };
    this.gestaoFormularioService
      .putFormularioJson(id, objFormulario)
      .subscribe({
        next: () => {},
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  tableLazyLoading() {
    this.getPesquisarFormulario(this.page, this.lazyLoading);
  }

  getPesquisarFormulario(pageEvent?: any, lazyLoading: boolean = false) {
    let assunto = this.formControl['assuntoFormulario']?.value;
    const assuntoLista = assunto?.map((item: any) => item.id);

    let situacao = this.formControl['situacaoFormulario']?.value;
    const situacaoLista = situacao?.map((item: any) => item.id);

    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      assunto: assunto === null ? null : assuntoLista,
      situacao: situacao === null ? null : situacaoLista,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoFormularioService.getFormulario(objParams).subscribe({
      next: (data: any) => {
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

  get formControl() {
    return this.gestaoFormularioFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoFormularioFiltroForm.reset();
    this.inicializarSituacao();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarFormulario(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarFormulario(obj: any) {
    const id = obj?.id;
    const objFormulario = {
      assunto: {
        id: obj?.assunto?.id,
        descricao: null,
      },
      situacao: {
        id: obj?.situacao?.id,
        descricao: null,
      },
      descricao: obj?.descricao,
      jsonForm: obj?.jsonForm,
      idPai: obj?.idPai,
      versao: obj?.versao,
    };
    if (id === undefined) {
      this.gestaoFormularioService.postFormulario(objFormulario).subscribe({
        next: (formulario: any) => {
          this.CADASTRAR_FORMULARIO.close();
          this.alertUtils.handleSucess(this.mensagens.MSG_FORMULARIO_SALVO);
          this.navegarFormulario(formulario);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoFormularioService.putFormulario(id, objFormulario).subscribe({
        next: (formulario: any) => {
          this.CADASTRAR_FORMULARIO.close();
          this.alertUtils.handleSucess(this.mensagens.MSG_FORMULARIO_ALTERADO);
          this.navegarFormulario(formulario);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  navegarFormulario(formulario: any) {
    this.construirformulario(formulario);
  }

  excluirForfmulario(item: any) {
    let msg = `Deseja excluir o formulário?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoFormularioService.deleteFormulario(item.id).subscribe({
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
    item.forEach((formulario: any) => {
      formulario.acoesFormulario = this.construirAcoes(
        formulario,
        todasVersoes
      );
    });
    return item;
  }

  private construirAcoes(formulario: any, todasVersoes: boolean) {
    let retorno: MenuItem[] = [];
    if (formulario.situacao.chave === 'ABERTO') {
      retorno.push({
        label: 'Formulário',
        expanded: true,
        items: [
          {
            label: 'Construção',
            icon: 'fa-solid fa-gears',
            command: () => this.construirformulario(this.selectedRowData),
          },
        ],
      });
    }
    retorno.push({
      label: 'Opções',
      expanded: true,
      items: this.construirItens(formulario, todasVersoes),
    });
    return retorno;
  }

  private construirItens(formulario: any, todasVersoes: boolean) {
    let retorno: MenuItem[] = [];

    retorno.push({
      label: 'Visualizar',
      icon: 'fa-solid fa-eye',
      command: () => this.construirformulario(this.selectedRowData, true),
    });

    if (formulario.acoesFormulario.includes('EDITAR')) {
      retorno.push({
        label: 'Editar',
        icon: 'fa-solid fa-file-pen',
        command: () => this.editarFormulario(this.selectedRowData),
      });
    }

    if (formulario.acoesFormulario.includes('EXCLUIR')) {
      retorno.push({
        label: 'Excluir',
        icon: 'fa-solid fa-trash',
        command: () => this.excluirForfmulario(this.selectedRowData),
      });
    }

    if (formulario.acoesFormulario.includes('REABRIR')) {
      retorno.push({
        label: 'Reabrir',
        icon: 'fa-lg fas fa-unlock',
        command: () =>
          this.trocarSituacaoFormulario(this.selectedRowData, 'REABRIR'),
      });
    }

    if (formulario.acoesFormulario.includes('FECHAR')) {
      retorno.push({
        label: 'Fechar',
        icon: 'fa-lg fas fa-lock',
        command: () =>
          this.trocarSituacaoFormulario(this.selectedRowData, 'FECHAR'),
      });
    }

    if (formulario.acoesFormulario.includes('CANCELAR')) {
      retorno.push({
        label: 'Cancelar',
        icon: 'fa-lg fas fa-ban',
        command: () =>
          this.trocarSituacaoFormulario(this.selectedRowData, 'CANCELAR'),
      });
    }

    if (formulario.acoesFormulario.includes('PUBLICAR')) {
      retorno.push({
        label: 'Publicar',
        icon: 'fa-lg fas fa-paper-plane',
        command: () =>
          this.trocarSituacaoFormulario(this.selectedRowData, 'PUBLICAR'),
      });
    }

    if (formulario.acoesFormulario.includes('SUSPENDER')) {
      retorno.push({
        label: 'Suspender',
        icon: 'fa-lg fas fa-circle-pause',
        command: () =>
          this.trocarSituacaoFormulario(this.selectedRowData, 'SUSPENDER'),
      });
    }

    if (formulario.acoesFormulario.includes('COPIAR')) {
      retorno.push({
        label: 'Copiar',
        icon: 'fa-lg fas fa-copy',
        command: () => this.copiarFormulario(this.selectedRowData),
      });
    }

    if (formulario.acoesFormulario.includes('VERSIONAR')) {
      retorno.push({
        label: 'Versionar',
        icon: 'fa-lg fas fa-square-plus',
        command: () => this.versionarFormulario(this.selectedRowData),
      });
    }

    if (todasVersoes && formulario.versao != 1) {
      retorno.push({
        label: 'Versões',
        icon: 'fa-solid fa-code-branch',
        command: () =>
          this.getTodasVersoesFormulario(this.selectedRowData, this.page),
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

  trocarSituacaoFormulario(obj: any, acao: any) {
    const id = obj?.id;
    const objFormulario = Object.values(AcoesEnum).find(
      (value) => value === acao
    );
    let msg = `
    Deseja ${objFormulario?.toLowerCase()} o formulário?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoFormularioService
          .patchFormulario(id, objFormulario)
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

  copiarFormulario(item: any) {
    let msg = `
    Deseja criar um cópia com base no Formulário - Assunto: ${item.assunto.descricao} - Descrição: ${item.descricao} - Versão: ${item.versao}?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoFormularioService.copiarFormulario(item.id).subscribe({
          next: () => {
            this.alertUtils.handleSucess(`Cópia realizada com sucesso`);
            this.tableLazyLoading();
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
      }
    });
  }

  versionarFormulario(item: any) {
    let msg = `
    Deseja criar uma versão com base no Formulário - ${item.descricao}?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.VERSIONAR_FORMULARIO.open(item);
      }
    });
  }

  executaVersionar(item: any) {
    this.gestaoFormularioService
      .versionarFormulario(item.id, item.motivo)
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

  getTodasVersoesFormulario(item: any, pageEvent?: any) {
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
    };

    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoFormularioService
      .getTodasVersoesFormulario(item.id, objParams)
      .subscribe({
        next: (data: any) => {
          let versoes = this.montarAcoesPermitidas(data.content || [], false);
          let totalElements = data.totalElements;
          this.VERSOES_FORMULARIO.open(
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
}
