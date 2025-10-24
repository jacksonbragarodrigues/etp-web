import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoTipoDelegacaoComponent } from './gestao-tipo-delegacao/gestao-tipo-delegacao.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoTipoDelegacaoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TipoDelegacaoModuleRoutingModule {}
