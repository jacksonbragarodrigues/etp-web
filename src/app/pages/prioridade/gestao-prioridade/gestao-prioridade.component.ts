import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { ModalCadastrarPrioridadeComponent } from '../modal-cadastrar-prioridade/modal-cadastrar-prioridade.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import GestaoBase from '../../shared/gestao-base';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { AlertUtils } from 'src/utils/alerts.util';
import { Page } from '@administrativo/components';
import { PrioridadeService } from 'src/app/services/prioridade.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestao-prioridade',
  templateUrl: './gestao-prioridade.component.html',
  styleUrl: './gestao-prioridade.component.scss',
})
export class GestaoPrioridadeComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_prioridade', { static: false })
  CADASTRAR_PRIORIDADE!: ModalCadastrarPrioridadeComponent;

  gestaoPrioridadeFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  prioridadeList: any[] = [];
  private lazyLoading: boolean = true;

  gestaoBase: GestaoBase = new GestaoBase();
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private gestaoPrioridadeService: PrioridadeService,
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

    this.gestaoPrioridadeFiltroForm = this.formBuilder.group({
      descricao: null,
    });
  }

  cadastrarPrioridade() {
    this.CADASTRAR_PRIORIDADE.open(null);
  }
  editarPrioridade(item: any) {
    this.CADASTRAR_PRIORIDADE.open(item);
  }

  tableLazyLoading(eventoLazy?: any) {
    this.getPesquisarPrioridade(this.page, this.lazyLoading);
  }

  getPesquisarPrioridade(pageEvent?: any, lazyLoading: boolean = false) {
    let descricao = this.formControl['descricao']?.value;
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      descricao: descricao,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoPrioridadeService.getPrioridade(objParams).subscribe({
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
    return this.gestaoPrioridadeFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoPrioridadeFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarPrioridade(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarPrioridade(obj: any) {
    const id = obj?.id;
    const objPrioridade = {
      descricao: obj?.descricao,
      chave: obj?.chave,
      padrao: obj?.padrao,
    };
    if (id === undefined) {
      this.gestaoPrioridadeService.postPrioridade(objPrioridade).subscribe({
        next: (data: any) => {
          this.CADASTRAR_PRIORIDADE.close();
          this.alertUtils.handleSucess(`Salvo com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoPrioridadeService.putPrioridade(id, objPrioridade).subscribe({
        next: (data: any) => {
          this.CADASTRAR_PRIORIDADE.close();
          this.alertUtils.handleSucess(`Alterado com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  excluirPrioridade(item: any) {
    let msg = `
    Deseja excluir a prioridade?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoPrioridadeService.deletePrioridade(item.id).subscribe({
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
