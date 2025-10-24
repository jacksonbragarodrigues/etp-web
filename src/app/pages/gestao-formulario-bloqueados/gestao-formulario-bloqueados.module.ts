import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestaoFormularioBloqueadosRoutingModule } from './gestao-formulario-bloqueados-routing.module';
import { GestaoFormularioBloqueadosComponent } from './gestao-formulario-bloqueados/gestao-formulario-bloqueados.component';
import { PrincipalModule } from '../principal/principal.module';
import { TableModule } from '@administrativo/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [GestaoFormularioBloqueadosComponent],
  imports: [
    CommonModule,
    GestaoFormularioBloqueadosRoutingModule,
    PrincipalModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
  ],
})
export class GestaoFormularioBloqueadosModule {}
