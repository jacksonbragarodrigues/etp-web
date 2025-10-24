import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoSituacaoComponent } from './gestao-situacao/gestao-situacao.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoSituacaoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SituacaoRoutingModule {}
