import { GestaoFormularioService } from './../../../services/gestao-formulario.service';
import { Page } from '@administrativo/components';
import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AssuntoFormularioServiceService } from 'src/app/services/assunto-formulario-service.service';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { AlertUtils } from 'src/utils/alerts.util';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import GestaoBase from '../../shared/gestao-base';
import { ModalCadastrarAssuntoComponent } from '../modal-cadastrar-assunto/modal-cadastrar-assunto.component';
import { ModalVisualizarFormularioPadraoComponent } from '../modal-visualizar-formulario-padrao/modal-visualizar-formulario-padrao.component';

@Component({
  selector: 'app-gestao-assunto',
  templateUrl: './gestao-assunto.component.html',
  styleUrl: './gestao-assunto.component.scss',
})
export class GestaoAssuntoComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_assunto', { static: false })
  CADASTRAR_ASSUNTO!: ModalCadastrarAssuntoComponent;

  @ViewChild('visualizar_formulario_padrao', { static: false })
  VISUALIZAR_FORMULARIO_PADRAO!: ModalVisualizarFormularioPadraoComponent;

  gestaoAssuntoFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  formularioList: any[] = [];
  assuntoList: any[] = [];
  situacaoList: any[] = [];
  private lazyLoading: boolean = true;
  gestaoBase: GestaoBase = new GestaoBase();
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private gestaoAssuntoService: AssuntoFormularioServiceService,
    private gestaoFormularioService: GestaoFormularioService
  ) {}

  ngOnInit(): void {
    this.iniciaPage();
    this.tableLazyLoading();
    this.gestaoFormularioService.getFormulariosPublicados().subscribe({
      next: (result) => {
        this.formularioList = result;
      },
      error: (erro) => {},
    });
  }

  iniciaPage() {
    this.page = {
      ...this.gestaoBase.initPage(),
      totalElements: this.page.totalElements,
      totalPages: Math.ceil(this.page.totalElements / this.page.size),
    };

    this.gestaoAssuntoFiltroForm = this.formBuilder.group({
      descricaoPesquisa: null,
    });
  }

  cadastrarAssunto() {
    this.CADASTRAR_ASSUNTO.open(null, this.formularioList);
  }
  editarAssunto(item: any) {
    this.CADASTRAR_ASSUNTO.open(item, this.formularioList);
  }

  tableLazyLoading(eventoLazy?: any) {
    this.getPesquisarAssunto(this.page, this.lazyLoading);
  }

  getPesquisarAssunto(pageEvent?: any, lazyLoading: boolean = false) {
    let descricaoPesquisa = this.formControl['descricaoPesquisa']?.value;

    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      descricao: descricaoPesquisa,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoAssuntoService.getAssunto(objParams).subscribe({
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
    return this.gestaoAssuntoFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoAssuntoFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarAssunto(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarAssunto(obj: any) {
    const id = obj?.id;
    const objAssunto = {
      descricao: obj?.descricao,
      chave: obj?.chave,
      sqFormularioAnalise: obj?.sqFormularioAnalise,
    };
    if (id === undefined) {
      this.gestaoAssuntoService.postAssunto(objAssunto).subscribe({
        next: (data: any) => {
          this.CADASTRAR_ASSUNTO.close();
          this.alertUtils.handleSucess(`Salvo com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.gestaoAssuntoService.putAssunto(id, objAssunto).subscribe({
        next: (data: any) => {
          this.CADASTRAR_ASSUNTO.close();
          this.alertUtils.handleSucess(`Alterado com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  visualizarFormularioPadrao(item: any) {
    if (item.jsonPadrao) {
      const obj = {
        jsonForm: item.jsonPadrao,
      };
      this.VISUALIZAR_FORMULARIO_PADRAO.open(obj);
    } else {
      this.alertUtils.toastrWarningMsg(
        `Assunto não possui Formulário Padrão definido.`
      );
    }
  }

  excluirAssunto(item: any) {
    let msg = `
    Deseja excluir o assunto?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoAssuntoService.deleteAssunto(item.id).subscribe({
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
