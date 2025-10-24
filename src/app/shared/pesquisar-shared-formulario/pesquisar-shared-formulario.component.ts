import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pesquisar-shared-formulario',
  templateUrl: './pesquisar-shared-formulario.component.html',
  styleUrl: './pesquisar-shared-formulario.component.scss',
})
export class PesquisarSharedFormularioComponent {
  @Input() tableLazyLoadingPai!: Function;
  @Input() limparCamposPai!: Function;

  tableLazyLoading() {
    this.tableLazyLoadingPai();
  }

  limparCampos() {
    this.limparCamposPai();
  }
}
