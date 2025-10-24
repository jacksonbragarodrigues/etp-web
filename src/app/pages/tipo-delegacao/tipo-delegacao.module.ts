import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PrincipalModule } from '../principal/principal.module';
import { GestaoTipoDelegacaoComponent } from './gestao-tipo-delegacao/gestao-tipo-delegacao.component';
import { ModalCadastrarTipoDelegacaoComponent } from './modal-cadastrar-tipo-delegacao/modal-cadastrar-tipo-delegacao.component';
import { TipoDelegacaoModuleRoutingModule } from './tipo-delegacao-routing.module';

@NgModule({
  declarations: [
    GestaoTipoDelegacaoComponent,
    ModalCadastrarTipoDelegacaoComponent,
  ],
  imports: [CommonModule, TipoDelegacaoModuleRoutingModule, PrincipalModule],
})
export class TipoDelegacaoModule {}
