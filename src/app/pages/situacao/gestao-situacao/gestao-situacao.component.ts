import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { ModalCadastrarSituacaoComponent } from '../modal-cadastrar-situacao/modal-cadastrar-situacao.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Page } from '@administrativo/components';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { AlertUtils } from 'src/utils/alerts.util';
import { SituacaoFormularioServiceService } from 'src/app/services/situacao-formulario-service.service';
import { Router } from '@angular/router';
import GestaoBase from '../../shared/gestao-base';

@Component({
  selector: 'app-gestao-situacao',
  templateUrl: './gestao-situacao.component.html',
  styleUrl: './gestao-situacao.component.scss',
})
export class GestaoSituacaoComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_situacao', { static: false })
  CADASTRAR_SITUACAO!: ModalCadastrarSituacaoComponent;

  gestaoSituacaoFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  situacaoList: any[] = [];
  private lazyLoading: boolean = true;

  gestaoBase: GestaoBase = new GestaoBase();
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private gestaoSituacaoService: SituacaoFormularioServiceService,
    private router: Router
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

    this.gestaoSituacaoFiltroForm = this.formBuilder.group({
      descricao: null,
    });
  }

  cadastrarSituacao() {
    this.CADASTRAR_SITUACAO.open(null);
  }
  editarSituacao(item: any) {
    this.CADASTRAR_SITUACAO.open(item);
  }

  tableLazyLoading(eventoLazy?: any) {
    this.getPesquisarSituacao(this.page, this.lazyLoading);
  }

  getPesquisarSituacao(pageEvent?: any, lazyLoading: boolean = false) {
    let descricao = this.formControl['descricao']?.value;
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      descricao: descricao,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoSituacaoService.getSituacao(objParams).subscribe({
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
    return this.gestaoSituacaoFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoSituacaoFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarSituacao(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarSituacao(obj: any) {
    const id = obj?.id;
    const objSituacao = {
      descricao: obj?.descricao,
      chave: obj?.chave,
    };
    if (id === undefined) {
      this.gestaoSituacaoService.postSituacao(objSituacao).subscribe({
        next: (data: any) => {
          this.CADASTRAR_SITUACAO.close();
          this.alertUtils.handleSucess(`Salvo com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoSituacaoService.putSituacao(id, objSituacao).subscribe({
        next: (data: any) => {
          this.CADASTRAR_SITUACAO.close();
          this.alertUtils.handleSucess(`Alterado com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  excluirSituacao(item: any) {
    let msg = `
    Deseja excluir o situação?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoSituacaoService.deleteSituacao(item.id).subscribe({
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
