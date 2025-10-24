import { Page } from '@administrativo/components';
import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ModalCadastrarEtpTipoLicitacaoComponent } from '../modal-cadastrar-etp-tipo-licitacao/modal-cadastrar-etp-tipo-licitacao.component';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { AlertUtils } from 'src/utils/alerts.util';
import { EtpTipoLicitacaoService } from 'src/app/services/etp-tipo-licitacao-service.service';

import GestaoBase from '../../shared/gestao-base';

@Component({
  selector: 'app-gestao-etp-tipo-licitacao',
  templateUrl: './gestao-etp-tipo-licitacao.component.html',
  styleUrl: './gestao-etp-tipo-licitacao.component.scss',
})
export class GestaoEtpTipoLicitacaoComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_etp_tipo_licitacao', { static: false })
  CADASTRAR_ETP_TIPO_LICITACAO!: ModalCadastrarEtpTipoLicitacaoComponent;

  gestaoEtpTipoLicitacaoFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  etpTipoLicitacaoList: any[] = [];
  situacaoList: any[] = [];
  private lazyLoading: boolean = true;

  gestaoBase: GestaoBase = new GestaoBase();
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private etpTipoLicitacaoService: EtpTipoLicitacaoService
  ) {}

  ngOnInit(): void {
    this.iniciaPage();
    this.tableLazyLoading();
  }

  iniciaPage() {
    this.page = {
      ...this.gestaoBase.initPage(),
      totalElements: this.page.totalElements,
      totalPages: Math.ceil(this.page.totalElements / this.page.size),
    };

    this.gestaoEtpTipoLicitacaoFiltroForm = this.formBuilder.group({
      descricaoPesquisa: null,
    });
  }

  cadastrarEtpTipoLicitacao() {
    this.CADASTRAR_ETP_TIPO_LICITACAO.open(null);
  }
  editarEtpTipoLicitacao(item: any) {
    this.CADASTRAR_ETP_TIPO_LICITACAO.open(item);
  }

  tableLazyLoading(eventoLazy?: any) {
    this.getPesquisaretpTipoLicitacao(this.page, this.lazyLoading);
  }

  getPesquisaretpTipoLicitacao(pageEvent?: any, lazyLoading: boolean = false) {
    let descricaoPesquisa = this.formControl['descricaoPesquisa']?.value;

    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      descricao: descricaoPesquisa,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.etpTipoLicitacaoService.getEtpTipoLicitacao(objParams).subscribe({
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

  get formControl() {
    return this.gestaoEtpTipoLicitacaoFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoEtpTipoLicitacaoFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisaretpTipoLicitacao(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarEtpTipoLicitacao(obj: any) {
    const id = obj?.id;
    const objetpTipoLicitacao = {
      descricao: obj?.descricao,
      chave: obj?.chave,
    };
    if (id === undefined) {
      this.etpTipoLicitacaoService
        .postEtpTipoLicitacao(objetpTipoLicitacao)
        .subscribe({
          next: (data: any) => {
            this.CADASTRAR_ETP_TIPO_LICITACAO.close();
            this.alertUtils.handleSucess(`Salvo com sucesso`);
            this.tableLazyLoading(this.lazyLoading);
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
    } else {
      this.etpTipoLicitacaoService
        .putEtpTipoLicitacao(id, objetpTipoLicitacao)
        .subscribe({
          next: (data: any) => {
            this.CADASTRAR_ETP_TIPO_LICITACAO.close();
            this.alertUtils.handleSucess(`Alterado com sucesso`);
            this.tableLazyLoading(this.lazyLoading);
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
    }
  }

  excluirEtpTipoLicitacao(item: any) {
    let msg = `
    Deseja excluir o tipo de contratação?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.etpTipoLicitacaoService.deleteEtpTipoLicitacao(item.id).subscribe({
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
}
