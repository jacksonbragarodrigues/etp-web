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
import { Page } from '@administrativo/components';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TabelaSortableHeader } from '../../../../../shared/tables/table-sortable';
import GestaoBase from '../../../../shared/gestao-base';

@Component({
  selector: 'versoes-etp',
  templateUrl: './versoes-etp.component.html',
  styleUrl: './versoes-etp.component.scss',
})
export class VersoesEtpComponent {
  @ViewChild('versoesEtpComponent') private modalContent:
    | TemplateRef<VersoesEtpComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();
  gestaoBase: GestaoBase = new GestaoBase();

  @Output() elaborarEtp = new EventEmitter();
  @Input() desabilitarCampos?: boolean;

  public titulo?: string;
  etpList: any[] = [];
  totalElements = 0;
  page: Page<any> = new Page<any>();
  selectedRowData: any | null = null;

  constructor(public modalService: NgbModal) {
    this.iniciaPageVersoesEtp();
  }

  iniciaPageVersoesEtp() {
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

  public open(
    etpList: any,
    totalElements: any,
    descricao: string
  ): Promise<boolean> {
    this.etpList = etpList;
    this.totalElements = totalElements;
    this.titulo = descricao;
    this.tableLazyLoading();

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        fullscreen: false,
        windowClass: 'modal-largura-customizada',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  tableLazyLoading() {
    this.page.content = this.etpList;
    this.page.totalElements = this.totalElements;
  }

  selecionarItem(event: Event, item: any) {
    event.stopPropagation();

    this.selectedRowData = item;
  }

  construirEtp(item: any) {
    this.elaborarEtp.emit(item);
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

  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
