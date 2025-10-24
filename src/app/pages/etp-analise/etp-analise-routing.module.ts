import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoEtpAnaliseComponent } from './gestao-etp-analise/gestao-etp-analise.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoEtpAnaliseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EtpAnaliseRoutingModule {}
