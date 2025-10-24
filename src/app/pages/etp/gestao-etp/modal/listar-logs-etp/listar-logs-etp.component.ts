import { Page } from '@administrativo/components';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-listar-logs-etp',
  templateUrl: './listar-logs-etp.component.html',
  styleUrl: './listar-logs-etp.component.scss',
})
export class ListarLogsEtpComponent {
  @ViewChild('logsEtp') private modalContent:
    | TemplateRef<ListarLogsEtpComponent>
    | undefined;
  modalRef!: NgbModalRef;

  listaLogsEtp: any[] = [];
  totalElementsLogEtp = 0;
  pageLogEtp: Page<any> = new Page<any>();
  selectedRowData: any | null = null;

  constructor(public modalService: NgbModal) {
    this.iniciaPageVersoesEtpListaLogs();
  }

  iniciaPageVersoesEtpListaLogs() {
    this.pageLogEtp = {
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: this.pageLogEtp.totalElements,
      totalPages: Math.ceil(
        this.pageLogEtp.totalElements / this.pageLogEtp.size
      ),
    };
  }

  public open(listaLogsEtp: any): Promise<boolean> {
    this.listaLogsEtp = listaLogsEtp;
    this.tableLazyLoadingLogEtp({});
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        fullscreen: false,
        windowClass: 'modal-largura-customizada-logs',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  tableLazyLoadingLogEtp(event: any) {
    this.pageLogEtp.content = this.listaLogsEtp;
    this.pageLogEtp.totalElements = this.totalElementsLogEtp;
  }

  public getDataModificacaoLogEtp(item: any) {
    return item?.dtAlteracao ?? item?.dtRegistro;
  }

  public getUsuarioModificacaoLogEtp(item: any) {
    return item?.codUsuarioAlteracao ?? item?.codUsuario;
  }

  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
