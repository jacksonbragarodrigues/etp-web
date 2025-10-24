import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { ModalCadastrarEtpEtapaComponent } from '../modal-cadastrar-etp-etapa/modal-cadastrar-etp-etapa.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Page } from '@administrativo/components';
import GestaoBase from '../../shared/gestao-base';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { AlertUtils } from 'src/utils/alerts.util';
import { EtpEtapaService } from 'src/app/services/etp-etapa-service.service';

@Component({
  selector: 'app-gestao-etp-etapa',
  templateUrl: './gestao-etp-etapa.component.html',
  styleUrl: './gestao-etp-etapa.component.scss',
})
export class GestaoEtpEtapaComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();

  @ViewChild('cadastrar_etp_etapa', { static: false })
  CADASTRAR_ETP_ETAPA!: ModalCadastrarEtpEtapaComponent;

  gestaoEtpEtapaFiltroForm!: FormGroup;
  page: Page<any> = new Page<any>();

  etpEtapaList: any[] = [];
  situacaoList: any[] = [];
  private lazyLoading: boolean = true;

  gestaoBase: GestaoBase = new GestaoBase();
  constructor(
    private formBuilder: FormBuilder,
    private biblioteca: BibliotecaUtils,
    private alertUtils: AlertUtils,
    private etpEtapaService: EtpEtapaService
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

    this.gestaoEtpEtapaFiltroForm = this.formBuilder.group({
      descricaoPesquisa: null,
    });
  }

  cadastrarEtpEtapa() {
    this.CADASTRAR_ETP_ETAPA.open(null);
  }
  editarEtpEtapa(item: any) {
    this.CADASTRAR_ETP_ETAPA.open(item);
  }

  tableLazyLoading(eventoLazy?: any) {
    this.getPesquisaretpEtapa(this.page, this.lazyLoading);
  }

  getPesquisaretpEtapa(pageEvent?: any, lazyLoading: boolean = false) {
    let descricaoPesquisa = this.formControl['descricaoPesquisa']?.value;

    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      descricao: descricaoPesquisa,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.etpEtapaService.getEtpEtapa(objParams).subscribe({
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
    return this.gestaoEtpEtapaFiltroForm.controls;
  }

  limparCampos() {
    this.gestaoEtpEtapaFiltroForm.reset();
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    this.getPesquisaretpEtapa(this.lazyLoading);
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
  }

  gravarEtpEtapa(obj: any) {
    const id = obj?.id;
    const objetpEtapa = {
      descricao: obj?.descricao,
      chave: obj?.chave,
    };
    if (id === undefined) {
      this.etpEtapaService.postEtpEtapa(objetpEtapa).subscribe({
        next: (data: any) => {
          this.CADASTRAR_ETP_ETAPA.close();
          this.alertUtils.handleSucess(`Salvo com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    } else {
      this.etpEtapaService.putEtpEtapa(id, objetpEtapa).subscribe({
        next: (data: any) => {
          this.CADASTRAR_ETP_ETAPA.close();
          this.alertUtils.handleSucess(`Alterado com sucesso`);
          this.tableLazyLoading(this.lazyLoading);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
    }
  }

  excluirEtpEtapa(item: any) {
    let msg = `
    Deseja excluir a etapa ETP?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.etpEtapaService.deleteEtpEtapa(item.id).subscribe({
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
