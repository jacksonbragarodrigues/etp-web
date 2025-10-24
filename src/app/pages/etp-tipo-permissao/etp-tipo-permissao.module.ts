import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EtpTipoPermissaoRoutingModule } from './etp-tipo-permissao-routing.module';
import { ModalCadastrarEtpTipoPermissaoComponent } from './modal-cadastrar-etp-tipo-permissao/modal-cadastrar-etp-tipo-permissao.component';
import { PrincipalModule } from '../principal/principal.module';
import { GestaoEtpTipoPermissaoComponent } from './gestao-etp-tipo-permissao/gestao-etp-tipo-permissao.component';

@NgModule({
  declarations: [
    ModalCadastrarEtpTipoPermissaoComponent,
    GestaoEtpTipoPermissaoComponent,
  ],
  imports: [CommonModule, EtpTipoPermissaoRoutingModule, PrincipalModule],
})
export class EtpTipoPermissaoModule {}
