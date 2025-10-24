import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoEtpNumeracaoComponent } from './gestao-etp-numeracao/gestao-etp-numeracao.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoEtpNumeracaoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EtpMumeracaoRoutingModule {}
