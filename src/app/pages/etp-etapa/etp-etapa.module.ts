import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EtpEtapaRoutingModule } from './etp-etapa-routing.module';
import { PrincipalModule } from '../principal/principal.module';
import { GestaoEtpEtapaComponent } from './gestao-etp-etapa/gestao-etp-etapa.component';
import { ModalCadastrarEtpEtapaComponent } from './modal-cadastrar-etp-etapa/modal-cadastrar-etp-etapa.component';

@NgModule({
  declarations: [GestaoEtpEtapaComponent, ModalCadastrarEtpEtapaComponent],
  imports: [CommonModule, EtpEtapaRoutingModule, PrincipalModule],
})
export class EtpEtapaModule {}
