import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoEtpBloqueadosComponent } from './gestao-etp-bloqueados/gestao-etp-bloqueados.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoEtpBloqueadosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestaoEtpBloqueadosRoutingModule {}
