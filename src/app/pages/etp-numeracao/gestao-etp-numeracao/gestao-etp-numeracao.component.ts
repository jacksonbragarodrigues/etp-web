import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Page } from '@administrativo/components';
import GestaoBase from '../../shared/gestao-base';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { AlertUtils } from 'src/utils/alerts.util';
import { EtpNumeracaoService } from 'src/app/services/etp-numeracao.service';
import { ModalCadastrarEtpNumeracaoComponent } from '../modal-cadastrar-etp-numeracao/modal-cadastrar-etp-numeracao.component';
import { GestaoEtpService } from '../../../services/gestao-etp.service';

@Component({
  selector: 'app-gestao-etp-numeracao',
  templateUrl: './gestao-etp-numeracao.component.html',
  styleUrl: './gestao-etp-numeracao.component.scss',
})
export class GestaoEtpNumeracaoComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_etp_numeracao', { static: false })
  CADASTRAR_NUMERACAO!: ModalCadastrarEtpNumeracaoComponent;

  gestaoEtpNumercaoFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  etpList: any[] = [];
  statusList: any[] = [];
  private lazyLoading: boolean = true;
  gestaoBase: GestaoBase = new GestaoBase();
  anoAtual: any;
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private gestaoEtpNumeracaoService: EtpNumeracaoService,
    private gestaoEtpService: GestaoEtpService
  ) {}

  ngOnInit(): void {
    this.iniciaPage();
    this.tableLazyLoading();
    this.carregarEtpList();
    this.cargarStatusList();
    this.setAnoAtual();
  }

  iniciaPage() {
    this.page = {
      ...this.gestaoBase.initPage(),
      totalElements: this.page.totalElements,
      totalPages: Math.ceil(this.page.totalElements / this.page.size),
    };
    this.gestaoEtpNumercaoFiltroForm = this.formBuilder.group({
      anoPesquisa: null,
      numeroPesquisa: null,
      statusPesquisa: null,
      etpPesquisa: null,
    });
  }

  cadastrarEtpNumeracao() {
    let etpListNaoEnumerados = this.etpList.filter(
      (x) => x.etpNumeracao == null
    );
    this.CADASTRAR_NUMERACAO.open(null, etpListNaoEnumerados, this.statusList);
  }

  editarEtpNumeracao(item: any) {
    let etpRegistrado = [];

    if (item.etp !== null) {
      etpRegistrado = this.etpList.filter((x) => x.id == item.etp?.id);
    }

    let etpListNaoEnumerados = this.etpList.filter(
      (x) => x.etpNumeracao == null
    );

    if (etpRegistrado.length > 0) {
      etpListNaoEnumerados.push(etpRegistrado[0]);
    }

    let etpNumeracao = {
      idNumeracaoEtp: item.idNumeracaoEtp,
      ano: item.ano,
      etp: item.etp != null ? item.etp.id : null,
      etpNumeracao: item.ultimaNumeracao,
      status: item.status,
    };
    this.CADASTRAR_NUMERACAO.open(
      etpNumeracao,
      etpListNaoEnumerados,
      this.statusList
    );
  }

  tableLazyLoading(eventoLazy?: any) {
    this.getPesquisarEtpNumeracao(this.page, this.lazyLoading);
  }

  getPesquisarEtpNumeracao(pageEvent?: any, lazyLoading: boolean = false) {
    let filtro = {
      ano: this.formControl['anoPesquisa']?.value,
      numero: this.formControl['numeroPesquisa']?.value,
      status: this.formControl['statusPesquisa']?.value,
      etp: this.formControl['etpPesquisa']?.value,
    };

    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      ano: filtro.ano,
      numero: filtro.numero,
      status: filtro.status,
      etpId: filtro.etp,
      ultimaNumeracao : true
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoEtpNumeracaoService.getEtpNumeracao(objParams).subscribe({
      next: (data: any) => {
        if (lazyLoading) {
          this.page.content = data.content;
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

  limparCampos() {
    this.gestaoEtpNumercaoFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarEtpNumeracao(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarEtpNumeracao(obj: any) {
    const idNumeracaoEtp = obj?.idNumeracaoEtp;
    const objEtpNumeracao = {
      ano: Number(obj?.ano),
      etpNumeracao: Number(obj?.etpNumeracao),
      status: Number(obj?.status),
      idEtp: Number(obj?.etp),
    };
    if (idNumeracaoEtp === undefined) {
      this.gestaoEtpNumeracaoService
        .postEtpNumeracao(objEtpNumeracao)
        .subscribe({
          next: (data: any) => {
            this.CADASTRAR_NUMERACAO.close();
            this.alertUtils.handleSucess(`Salvo com sucesso`);
            this.tableLazyLoading(this.lazyLoading);
            this.carregarEtpList();
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
    } else {
      this.gestaoEtpNumeracaoService
        .putEtpNumeracao(idNumeracaoEtp, objEtpNumeracao)
        .subscribe({
          next: (data: any) => {
            this.CADASTRAR_NUMERACAO.close();
            this.alertUtils.handleSucess(`Alterado com sucesso`);
            this.tableLazyLoading(this.lazyLoading);
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
    }
  }

  excluirEtpNumeracao(item: any) {
    let msg = `Deseja excluir a numeração?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpNumeracaoService
          .deleteEtpNumeracao(item.idNumeracaoEtp)
          .subscribe({
            next: (data: any) => {
              this.alertUtils.handleSucess(`Excluido com sucesso`);
              this.tableLazyLoading(this.lazyLoading);
            },
            error: (e: any) => {
              this.alertUtils.toastrErrorMsg(e);
            },
          });
      }
    });
  }

  get formControl() {
    return this.gestaoEtpNumercaoFiltroForm.controls;
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

  acaoPermitida(item: any, acao: string): boolean {
    return true;
  }

  private carregarEtpList() {
    this.gestaoEtpService.getEtpLista().subscribe({
      next: (data: any) => {
        this.etpList = this.parseEtpList(data);
      },
      error: (e: any) => {
        this.alertUtils.handleError(e);
      },
    });
  }

  private parseEtpList(etps: any) {
    return etps.map((etp: any) => {
      return {
        id: etp.id,
        nome: etp.id + '-' + etp.descricao,
        etpNumeracao: etp.etpNumeracao,
      };
    });
  }

  private cargarStatusList() {
    this.statusList.push({ id: 1, nome: 'ATIVO' });
    this.statusList.push({ id: 0, nome: 'INATIVO' });
  }

  montarNomeEtp(item: any) {
    return item?.etp != null
      ? item?.etp?.id + ' - ' + item?.etp?.descricao
      : 'Numeração sem ETP relacionado  ';
  }

  monstarStatus(item: any) {
    return item?.status === 1 ? 'ATIVO' : 'INATIVO';
  }

  setAnoAtual() {
    this.anoAtual = new Date().getFullYear();
  }
}
