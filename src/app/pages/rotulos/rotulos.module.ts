import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RotulosRoutingModule } from './rotulos-routing.module';
import { PrincipalModule } from '../principal/principal.module';
import { ModalCadastrarRotulosComponent } from './modal-cadastrar-rotulos/modal-cadastrar-rotulos.component';
import { GestaoRotulosComponent } from './gestao-rotulos/gestao-rotulos.component';

@NgModule({
  declarations: [ModalCadastrarRotulosComponent, GestaoRotulosComponent],
  imports: [CommonModule, RotulosRoutingModule, PrincipalModule],
})
export class RotulosModule {}
