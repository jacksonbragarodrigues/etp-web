import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestaoRotulosComponent } from './gestao-rotulos/gestao-rotulos.component';

const routes: Routes = [{ path: '', component: GestaoRotulosComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RotulosRoutingModule {}
