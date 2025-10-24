import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DelegarAcessoComponent} from "./delegar-acesso.component";

const routes: Routes = [
  {
    path: '',
    component: DelegarAcessoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DelegarAcessoRoutingModule {}
