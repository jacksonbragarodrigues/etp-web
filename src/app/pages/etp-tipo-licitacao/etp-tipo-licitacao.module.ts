import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EtpTipoLicitacaoRoutingModule } from './etp-tipo-licitacao-routing.module';
import { PrincipalModule } from '../principal/principal.module';
import { GestaoEtpTipoLicitacaoComponent } from './gestao-etp-tipo-licitacao/gestao-etp-tipo-licitacao.component';
import { ModalCadastrarEtpTipoLicitacaoComponent } from './modal-cadastrar-etp-tipo-licitacao/modal-cadastrar-etp-tipo-licitacao.component';
import { EtpUnidadeAnaliseModule } from '../etp-unidade-analise/etp-unidade-analise.module';
import { EtpPrazoModule } from '../etp-prazo/etp-prazo.module';
import { MenuLateralModule } from '@administrativo/components';

@NgModule({
  declarations: [
    GestaoEtpTipoLicitacaoComponent,
    ModalCadastrarEtpTipoLicitacaoComponent,
  ],
  imports: [
    CommonModule,
    EtpTipoLicitacaoRoutingModule,
    PrincipalModule,
    EtpUnidadeAnaliseModule,
    EtpPrazoModule,
    MenuLateralModule
  ],
})
export class EtpTipoLicitacaoModule {}
