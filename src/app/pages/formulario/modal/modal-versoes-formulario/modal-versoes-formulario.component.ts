import {
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@administrativo/components';
import { TabelaSortableHeader } from '../../../../shared/tables/table-sortable';
import GestaoBase from '../../../shared/gestao-base';

@Component({
  selector: 'modal-versoes-formulario',
  templateUrl: './modal-versoes-formulario.component.html',
  styleUrls: ['./modal-versoes-formulario.component.scss'],
})
export class ModalVersoesFormularioComponent {
  @ViewChild('modalVersoesFormularioComponent') private modalContent:
    | TemplateRef<ModalVersoesFormularioComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();
  gestaoBase: GestaoBase = new GestaoBase();

  @Output() construirFormulario = new EventEmitter();
  @Input() desabilitarCampos?: boolean;

  public titulo?: string;
  formularioList: any[] = [];
  totalElements = 0;
  page: Page<any> = new Page<any>();
  selectedRowData: any | null = null;

  constructor(public modalService: NgbModal) {
    this.iniciaPage();
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
  }

  open(
    formularioList: any,
    totalElements: any,
    descricao: string
  ): Promise<boolean> {
    this.formularioList = formularioList;
    this.totalElements = totalElements;
    this.titulo = descricao;
    this.tableLazyLoading();

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        fullscreen: false,
        size: 'xl',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  tableLazyLoading() {
    this.page.content = this.formularioList;
    this.page.totalElements = this.totalElements;
  }

  selecionarItem(event: Event, item: any) {
    event.stopPropagation();
    this.selectedRowData = item;
  }

  construirformulario(item: any) {
    this.construirFormulario.emit(item);
  }

  onSort({ coluna, direcao }: any) {
    this.page.sort = direcao ? `${coluna},${direcao}` : '';
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== coluna) {
        header.direcao = '';
      } else {
        header.direcao = direcao;
      }
    });
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

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }
}
