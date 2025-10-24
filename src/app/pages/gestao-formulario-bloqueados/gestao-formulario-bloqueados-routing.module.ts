import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoFormularioBloqueadosComponent } from './gestao-formulario-bloqueados/gestao-formulario-bloqueados.component';

const routes: Routes = [
  {
    path: '',
    component: GestaoFormularioBloqueadosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestaoFormularioBloqueadosRoutingModule {}
