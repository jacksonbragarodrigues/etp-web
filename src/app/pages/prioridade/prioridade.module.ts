import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrioridadeRoutingModule } from './prioridade-routing.module';
import { PrincipalModule } from '../principal/principal.module';
import { GestaoPrioridadeComponent } from './gestao-prioridade/gestao-prioridade.component';
import { ModalCadastrarPrioridadeComponent } from './modal-cadastrar-prioridade/modal-cadastrar-prioridade.component';

@NgModule({
  declarations: [GestaoPrioridadeComponent, ModalCadastrarPrioridadeComponent],
  imports: [CommonModule, PrioridadeRoutingModule, PrincipalModule],
})
export class PrioridadeModule {}
