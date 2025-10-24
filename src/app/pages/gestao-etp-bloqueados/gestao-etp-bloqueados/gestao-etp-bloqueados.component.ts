import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import GestaoBase from '../../shared/gestao-base';
import { Page } from '@administrativo/components';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';
import { AlertUtils } from 'src/utils/alerts.util';

@Component({
  selector: 'app-gestao-etp-bloqueados',
  templateUrl: './gestao-etp-bloqueados.component.html',
  styleUrl: './gestao-etp-bloqueados.component.scss',
})
export class GestaoEtpBloqueadosComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();
  gestaoBase: GestaoBase = new GestaoBase();
  public titulo?: string;
  etpList: any[] = [];
  totalElements = 0;
  pageEtpBloqueados: Page<any> = new Page<any>();
  selectedRowData: any | null = null;

  constructor(
    private gestaoEtpService: GestaoEtpService,
    private alertUtils: AlertUtils
  ) {}

  iniciaPageVersoesEtp() {
    this.pageEtpBloqueados = {
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: this.pageEtpBloqueados.totalElements,
      totalPages: Math.ceil(
        this.pageEtpBloqueados.totalElements / this.pageEtpBloqueados.size
      ),
    };
  }

  ngOnInit() {
    this.titulo = 'ETPs Bloqueados';
    this.iniciaEtpsBloqueados();
  }

  iniciaEtpsBloqueados() {
    this.gestaoEtpService.getEtpListaBloqueados().subscribe((response: any) => {
      this.etpList = response;
      this.gestaoBase.initPage();
      this.iniciaPageVersoesEtp();
      this.tableLazyLoading();
    });
  }

  desbloquearEtp(idEtp: any) {
    let msg = `Deseja desbloquear o ETP?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpService
          .putBloqueioEtp(idEtp, {
            bloqueado: false,
          })
          .subscribe(() => {
            this.iniciaEtpsBloqueados();
          });
      }
    });
  }

  tableLazyLoading(eventoLazyEtpBloqueados?: any) {
    this.pageEtpBloqueados.content = this.etpList;
    this.pageEtpBloqueados.totalElements = this.totalElements;
  }

  selecionarItem(eventEtpBloqueados: Event, itemEtpBloqueados: any) {
    eventEtpBloqueados.stopPropagation();

    this.selectedRowData = itemEtpBloqueados;
  }

  onSort({ colunaEtpBloqueados, direcaoEtpBloqueados }: any) {
    this.pageEtpBloqueados.sort = direcaoEtpBloqueados
      ? `${colunaEtpBloqueados},${direcaoEtpBloqueados}`
      : '';
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== direcaoEtpBloqueados) {
        header.direcao = '';
      } else {
        header.direcao = direcaoEtpBloqueados;
      }
    });
  }
}
