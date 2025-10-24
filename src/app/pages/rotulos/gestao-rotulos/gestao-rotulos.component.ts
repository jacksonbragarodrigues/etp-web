import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { ModalCadastrarRotulosComponent } from '../modal-cadastrar-rotulos/modal-cadastrar-rotulos.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Page } from '@administrativo/components';
import GestaoBase from '../../shared/gestao-base';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { AlertUtils } from 'src/utils/alerts.util';
import { RotulosFormularioService } from 'src/app/services/rotulos-formulario-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestao-rotulos',
  templateUrl: './gestao-rotulos.component.html',
  styleUrl: './gestao-rotulos.component.scss',
})
export class GestaoRotulosComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_rotulos', { static: false })
  CADASTRAR_Rotulos!: ModalCadastrarRotulosComponent;

  gestaoRotulosFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  RotulosList: any[] = [];
  situacaoList: any[] = [];
  private lazyLoading: boolean = true;
  gestaoBase: GestaoBase = new GestaoBase();
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private gestaoRotulosService: RotulosFormularioService,
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

    this.gestaoRotulosFiltroForm = this.formBuilder.group({
      dePesquisa: null,
      paraPesquisa: null,
    });
  }

  cadastrarRotulos() {
    this.CADASTRAR_Rotulos.open(null);
  }
  editarRotulos(item: any) {
    this.CADASTRAR_Rotulos.open(item);
  }

  tableLazyLoading(eventoLazy?: any) {
    this.getPesquisarRotulos(this.page, this.lazyLoading);
  }

  getPesquisarRotulos(pageEvent?: any, lazyLoading: boolean = false) {
    let dePesquisa = this.formControl['dePesquisa']?.value;
    let paraPesquisa = this.formControl['paraPesquisa']?.value;

    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      de: dePesquisa,
      para: paraPesquisa,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoRotulosService.getRotulos(objParams).subscribe({
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
    return this.gestaoRotulosFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoRotulosFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarRotulos(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarRotulos(obj: any) {
    const id = obj?.id;
    const objRotulos = {
      de: obj?.de,
      para: obj?.para,
    };
    if (id === undefined) {
      this.gestaoRotulosService.postRotulos(objRotulos).subscribe({
        next: (data: any) => {
          this.CADASTRAR_Rotulos.close();
          this.alertUtils.handleSucess(`Salvo com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoRotulosService.putRotulos(id, objRotulos).subscribe({
        next: (data: any) => {
          this.CADASTRAR_Rotulos.close();
          this.alertUtils.handleSucess(`Alterado com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  excluirRotulos(item: any) {
    let msg = `
    Deseja excluir o Rótulo?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoRotulosService.deleteRotulos(item.id).subscribe({
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
