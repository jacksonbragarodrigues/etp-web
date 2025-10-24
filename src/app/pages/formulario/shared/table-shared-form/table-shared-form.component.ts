import { Page } from '@administrativo/components';
import { Component, Input } from '@angular/core';
import GestaoBase from 'src/app/pages/shared/gestao-base';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-table-shared-form',
  templateUrl: './table-shared-form.component.html',
  styleUrl: './table-shared-form.component.scss',
})
export class TableSharedFormComponent {
  @Input() tableLazyLoadingPai!: Function;
  @Input() gestaoBase!: GestaoBase;
  @Input() construirFormulario!: Function;
  @Input() selecionarFormulario!: Function;
  @Input() onSortPai!: Function;
  @Input() page!: Page<any>;
  @Input() sobreporMenuAcaoForm!: boolean;
  @Input() desabilitarCampos?: boolean;

  tableLazyLoading(event: any) {
    this.tableLazyLoadingPai(event);
  }

  onSort(event: any) {
    this.onSortPai(event);
  }

  construirForm(event: any) {
    this.construirFormulario(event);
  }

  selecionaForm(event: any, item: any) {
    event.stopPropagation();
    this.selecionarFormulario(event, item);
  }

  nivelMenuAcaoForm(op: OverlayPanel) {
    if (this.sobreporMenuAcaoForm) {
      op.styleClass = 'menu-modal';
    }
  }
}
