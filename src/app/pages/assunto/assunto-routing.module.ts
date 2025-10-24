import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoAssuntoComponent } from './gestao-assunto/gestao-assunto.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoAssuntoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssuntoRoutingModule {}
