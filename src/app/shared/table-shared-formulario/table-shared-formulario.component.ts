import { Page } from '@administrativo/components';
import { Component, Input } from '@angular/core';
import GestaoBase from 'src/app/pages/shared/gestao-base';

@Component({
  selector: 'app-table-shared-formulario',
  templateUrl: './table-shared-formulario.component.html',
  styleUrl: './table-shared-formulario.component.scss',
})
export class TableSharedFormularioComponent {
  @Input() tableLazyLoadingPai!: Function;
  @Input() onSortPai!: Function;
  @Input() gestaoBase!: GestaoBase;
  @Input() page!: Page<any>;
  @Input() editarPai!: Function;
  @Input() excluirPai!: Function;
  @Input() acaoExtraPai!: Function;
  @Input() toolTipAcaoExtra!: string;
  @Input() iconeAcaoExtra!: string;

  tableLazyLoading(event: any) {
    this.tableLazyLoadingPai(event);
  }

  onSort(event: any) {
    this.onSortPai(event);
  }

  editar(event: any) {
    this.editarPai(event);
  }

  excluir(event: any) {
    this.excluirPai(event);
  }

  acaoExtra(event: any) {
    this.acaoExtraPai(event);
  }
}
