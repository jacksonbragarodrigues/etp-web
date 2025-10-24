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
import { EtpTipoPermissaoService } from 'src/app/services/etp-tipo-permissao.service';
import { Router } from '@angular/router';
import { ModalCadastrarEtpTipoPermissaoComponent } from '../modal-cadastrar-etp-tipo-permissao/modal-cadastrar-etp-tipo-permissao.component';

@Component({
  selector: 'app-gestao-etp-tipo-permissao',
  templateUrl: './gestao-etp-tipo-permissao.component.html',
  styleUrl: './gestao-etp-tipo-permissao.component.scss',
})
export class GestaoEtpTipoPermissaoComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_etp_tipo_permissao', { static: false })
  CADASTRAR_ETP_TIPO_PERMISSAO!: ModalCadastrarEtpTipoPermissaoComponent;

  gestaoEtpTipoPermissaoFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  EtpTipoPermissaoList: any[] = [];
  private lazyLoading: boolean = true;

  gestaoBase: GestaoBase = new GestaoBase();
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private gestaoEtpTipoPermissaoService: EtpTipoPermissaoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.iniciaPage();
    this.tableLazyLoadingTipoPermissao();
  }

  iniciaPage() {
    this.page = {
      ...this.gestaoBase.initPage(),
      totalElements: this.page.totalElements,
      totalPages: Math.ceil(this.page.totalElements / this.page.size),
    };

    this.gestaoEtpTipoPermissaoFiltroForm = this.formBuilder.group({
      descricaoTipoPermissao: null,
    });
  }

  cadastrarEtpTipoPermissao() {
    this.CADASTRAR_ETP_TIPO_PERMISSAO.open(null);
  }
  editarEtpTipoPermissao(item: any) {
    this.CADASTRAR_ETP_TIPO_PERMISSAO.open(item);
  }

  tableLazyLoadingTipoPermissao(eventoLazy?: any) {
    this.getPesquisarEtpTipoPermissao(this.page, this.lazyLoading);
  }

  getPesquisarEtpTipoPermissao(pageEvent?: any, lazyLoading: boolean = false) {
    let descricao = this.formControl['descricaoTipoPermissao']?.value;
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      descricao: descricao,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.gestaoEtpTipoPermissaoService
      .getEtpTipoPermissao(objParams)
      .subscribe({
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
    return this.gestaoEtpTipoPermissaoFiltroForm.controls;
  }

  limparCamposTipoPermissao() {
    this.gestaoEtpTipoPermissaoFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisarEtpTipoPermissao(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarEtpTipoPermissao(obj: any) {
    const id = obj?.id;
    const objEtpTipoPermissao = {
      descricao: obj?.descricao,
      chave: obj?.chave,
      indStRegistro: obj?.indStRegistro,
    };
    if (id === undefined) {
      this.gestaoEtpTipoPermissaoService
        .postEtpTipoPermissao(objEtpTipoPermissao)
        .subscribe({
          next: (data: any) => {
            this.CADASTRAR_ETP_TIPO_PERMISSAO.close();
            this.alertUtils.handleSucess(`Salvo com sucesso`);
            this.tableLazyLoadingTipoPermissao(this.lazyLoading);
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
    } else {
      this.gestaoEtpTipoPermissaoService
        .putEtpTipoPermissao(id, objEtpTipoPermissao)
        .subscribe({
          next: (data: any) => {
            this.CADASTRAR_ETP_TIPO_PERMISSAO.close();
            this.alertUtils.handleSucess(`Alterado com sucesso`);
            this.tableLazyLoadingTipoPermissao(this.lazyLoading);
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
    }
  }

  excluirEtpTipoPermissao(item: any) {
    let msg = `
    Deseja excluir o Etp Tipo Permissão?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpTipoPermissaoService
          .deleteEtpTipoPermissao(item.id)
          .subscribe({
            next: (data: any) => {
              this.alertUtils.handleSucess(`Excluido com sucesso`);
              this.tableLazyLoadingTipoPermissao(this.lazyLoading);
            },
            error: (e: any) => {
              this.alertUtils.toastrErrorMsg(e);
            },
          });
      }
    });
  }
}
