import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoEtpEtapaComponent } from './gestao-etp-etapa/gestao-etp-etapa.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoEtpEtapaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EtpEtapaRoutingModule {}
