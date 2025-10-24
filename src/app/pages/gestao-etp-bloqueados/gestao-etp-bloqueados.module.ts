import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestaoEtpBloqueadosRoutingModule } from './gestao-etp-bloqueados-routing.module';
import { GestaoEtpBloqueadosComponent } from './gestao-etp-bloqueados/gestao-etp-bloqueados.component';
import { PrincipalModule } from '../principal/principal.module';
import { TableModule } from '@administrativo/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [GestaoEtpBloqueadosComponent],
  imports: [
    CommonModule,
    GestaoEtpBloqueadosRoutingModule,
    PrincipalModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
  ],
  exports: [
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
  ],
})
export class GestaoEtpBloqueadosModule {}
