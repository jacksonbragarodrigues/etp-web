import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PrincipalModule } from '../principal/principal.module';
import { AssuntoRoutingModule } from './assunto-routing.module';
import { GestaoAssuntoComponent } from './gestao-assunto/gestao-assunto.component';
import { ModalCadastrarAssuntoComponent } from './modal-cadastrar-assunto/modal-cadastrar-assunto.component';
import { ModalVisualizarFormularioPadraoComponent } from './modal-visualizar-formulario-padrao/modal-visualizar-formulario-padrao.component';

@NgModule({
  declarations: [
    GestaoAssuntoComponent,
    ModalCadastrarAssuntoComponent,
    ModalVisualizarFormularioPadraoComponent,
  ],
  imports: [CommonModule, AssuntoRoutingModule, PrincipalModule],
})
export class AssuntoModule {}
