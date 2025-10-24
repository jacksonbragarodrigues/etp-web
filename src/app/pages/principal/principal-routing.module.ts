import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoFormularioComponent } from '../formulario/gestao-formulario/gestao-formulario.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoFormularioComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrincipalRoutingModule {}
