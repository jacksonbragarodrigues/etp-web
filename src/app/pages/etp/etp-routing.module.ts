import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoEtpComponent } from './gestao-etp/gestao-etp.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoEtpComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EtpRoutingModule {}
