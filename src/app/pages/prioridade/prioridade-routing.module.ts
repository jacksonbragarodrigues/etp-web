import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoPrioridadeComponent } from './gestao-prioridade/gestao-prioridade.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoPrioridadeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrioridadeRoutingModule {}
