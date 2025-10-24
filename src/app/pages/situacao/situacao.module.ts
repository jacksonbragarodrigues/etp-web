import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SituacaoRoutingModule } from './situacao-routing.module';
import { PrincipalModule } from '../principal/principal.module';
import { GestaoSituacaoComponent } from './gestao-situacao/gestao-situacao.component';
import { ModalCadastrarSituacaoComponent } from './modal-cadastrar-situacao/modal-cadastrar-situacao.component';

@NgModule({
  declarations: [GestaoSituacaoComponent, ModalCadastrarSituacaoComponent],
  imports: [CommonModule, SituacaoRoutingModule, PrincipalModule],
})
export class SituacaoModule {}
