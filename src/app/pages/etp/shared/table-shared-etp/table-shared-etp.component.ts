import { Page } from '@administrativo/components';
import { Component, Input } from '@angular/core';
import GestaoBase from 'src/app/pages/shared/gestao-base';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-table-shared-etp',
  templateUrl: './table-shared-etp.component.html',
  styleUrl: './table-shared-etp.component.scss',
})
export class TableSharedEtpComponent {
  @Input() tableLazyLoadingPai!: Function;
  @Input() elaborar!: Function;
  @Input() gestaoBase!: GestaoBase;
  @Input() selecionarEtp!: Function;
  @Input() onSortPai!: Function;
  @Input() page!: Page<any>;
  @Input() sobreporMenuAcaoEtp!: boolean;
  @Input() desabilitarCampos?: boolean;

  tableLazyLoading(event: any) {
    this.tableLazyLoadingPai(event);
  }

  onSort(event: any) {
    this.onSortPai(event);
  }

  elaborarEtp(event: any) {
    this.elaborar(event);
  }

  selecionaItem(event: any, item: any) {
    event.stopPropagation();
    this.selecionarEtp(event, item);
  }

  nivelMenuAcaoEtp(op: OverlayPanel) {
    if (this.sobreporMenuAcaoEtp) {
      op.styleClass = 'menu-modal';
    }
  }
}
