import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import GestaoBase from '../../shared/gestao-base';
import { Page } from '@administrativo/components';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { AlertUtils } from 'src/utils/alerts.util';

@Component({
  selector: 'app-gestao-formulario-bloqueados',
  templateUrl: './gestao-formulario-bloqueados.component.html',
  styleUrl: './gestao-formulario-bloqueados.component.scss',
})
export class GestaoFormularioBloqueadosComponent implements OnInit {
  @ViewChildren(TabelaSortableHeader)
  headers = new QueryList<TabelaSortableHeader>();
  gestaoBase: GestaoBase = new GestaoBase();
  public titulo?: string;
  formularioList: any[] = [];
  totalElements = 0;
  pageFormularioBloqueados: Page<any> = new Page<any>();
  selectedRowData: any | null = null;

  constructor(
    private gestaoFormularioService: GestaoFormularioService,
    private alertUtils: AlertUtils
  ) {}

  iniciaPageVersoesFormulario() {
    this.pageFormularioBloqueados = {
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: this.pageFormularioBloqueados.totalElements,
      totalPages: Math.ceil(
        this.pageFormularioBloqueados.totalElements /
          this.pageFormularioBloqueados.size
      ),
    };
  }

  ngOnInit() {
    this.titulo = 'Modelos Bloqueados';
    this.iniciaFormulariosBloqueados();
  }

  iniciaFormulariosBloqueados() {
    this.gestaoFormularioService
      .getFormularioListaBloqueados()
      .subscribe((response: any) => {
        this.formularioList = response;
        this.gestaoBase.initPage();
        this.iniciaPageVersoesFormulario();
        this.tableLazyLoading();
      });
  }

  desbloquearEtp(idFormulario: any) {
    let msg = `Deseja desbloquear o Formulário?`;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoFormularioService
          .putBloqueioFormulario(idFormulario, {
            bloqueado: false,
          })
          .subscribe(() => {
            this.iniciaFormulariosBloqueados();
          });
      }
    });
  }

  tableLazyLoading(eventoLazyFormularioBloqueados?: any) {
    this.pageFormularioBloqueados.content = this.formularioList;
    this.pageFormularioBloqueados.totalElements = this.totalElements;
  }

  selecionarItem(event: Event, item: any) {
    event.stopPropagation();

    this.selectedRowData = item;
  }

  onSort({ colunaFormularioBloqueados, direcaoFormularioBloqueados }: any) {
    this.pageFormularioBloqueados.sort = direcaoFormularioBloqueados
      ? `${colunaFormularioBloqueados},${direcaoFormularioBloqueados}`
      : '';
    /**RESET COLUNA DIREÇÂO PAGINACAO  */
    this.headers?.forEach((header) => {
      if (header.sortable !== colunaFormularioBloqueados) {
        header.direcao = '';
      } else {
        header.direcao = direcaoFormularioBloqueados;
      }
    });
  }
}
