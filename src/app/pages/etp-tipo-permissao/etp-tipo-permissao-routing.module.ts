import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoEtpTipoPermissaoComponent } from './gestao-etp-tipo-permissao/gestao-etp-tipo-permissao.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoEtpTipoPermissaoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EtpTipoPermissaoRoutingModule {}
