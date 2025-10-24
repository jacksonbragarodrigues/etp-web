import { Page } from '@administrativo/components';
import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TipoDelegacaoService } from 'src/app/services/tipo-delegacao.service';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { AlertUtils } from 'src/utils/alerts.util';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import GestaoBase from '../../shared/gestao-base';
import { ModalCadastrarTipoDelegacaoComponent } from '../modal-cadastrar-tipo-delegacao/modal-cadastrar-tipo-delegacao.component';

@Component({
  selector: 'app-gestao-tipo-delegacao',
  templateUrl: './gestao-tipo-delegacao.component.html',
  styleUrl: './gestao-tipo-delegacao.component.scss',
})
export class GestaoTipoDelegacaoComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_tipo_delegacao', { static: false })
  CADASTRAR_TIPO_DELEGACAO!: ModalCadastrarTipoDelegacaoComponent;

  gestaoTipoDelegacaoFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  tipoDelegacaoList: any[] = [];
  private lazyLoading: boolean = true;
  gestaoBase: GestaoBase = new GestaoBase();
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private service: TipoDelegacaoService,
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

    this.gestaoTipoDelegacaoFiltroForm = this.formBuilder.group({
      descricaoPesquisa: null,
    });
  }

  cadastrarTipoDelegacao() {
    this.CADASTRAR_TIPO_DELEGACAO.open(null);
  }
  editarTipoDelegacao(item: any) {
    this.CADASTRAR_TIPO_DELEGACAO.open(item);
  }

  tableLazyLoading(eventoLazy?: any) {
    this.getPesquisarTipoDelegacao(this.page, this.lazyLoading);
  }

  getPesquisarTipoDelegacao(pageEvent?: any, lazyLoading: boolean = false) {
    let descricaoPesquisa = this.formControl['descricaoPesquisa']?.value;

    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      descricao: descricaoPesquisa,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.service.getTipoDelegacao(objParams).subscribe({
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
    return this.gestaoTipoDelegacaoFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoTipoDelegacaoFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarTipoDelegacao(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarTipoDelegacao(obj: any) {
    const id = obj?.id;
    const objTipoDelegacao = {
      descricao: obj?.descricao,
      chave: obj?.chave,
    };
    if (id === undefined) {
      this.service.postTipoDelegacao(objTipoDelegacao).subscribe({
        next: (data: any) => {
          this.CADASTRAR_TIPO_DELEGACAO.close();
          this.alertUtils.handleSucess(`Salvo com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.service.putTipoDelegacao(id, objTipoDelegacao).subscribe({
        next: (data: any) => {
          this.CADASTRAR_TIPO_DELEGACAO.close();
          this.alertUtils.handleSucess(`Alterado com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  excluirTipoDelegacao(item: any) {
    let msg = `
    Deseja excluir o tipo de delegação?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.service.deleteTipoDelegacao(item.id).subscribe({
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
