import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoEtpTipoLicitacaoComponent } from './gestao-etp-tipo-licitacao/gestao-etp-tipo-licitacao.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoEtpTipoLicitacaoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EtpTipoLicitacaoRoutingModule {}
