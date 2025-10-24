import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EtpMumeracaoRoutingModule } from './etp-mumeracao-routing.module';
import { PrincipalModule } from '../principal/principal.module';
import { GestaoEtpNumeracaoComponent } from './gestao-etp-numeracao/gestao-etp-numeracao.component';
import { ModalCadastrarEtpNumeracaoComponent } from './modal-cadastrar-etp-numeracao/modal-cadastrar-etp-numeracao.component';

@NgModule({
  declarations: [GestaoEtpNumeracaoComponent, ModalCadastrarEtpNumeracaoComponent],
  imports: [CommonModule, EtpMumeracaoRoutingModule, PrincipalModule],
})
export class EtpNumeracaoModule {}
