import {
  TableModule
} from '@administrativo/components';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PrincipalModule } from '../principal/principal.module';
import { EtpUnidadeAnaliseComponent } from './etp-unidade-analise.component';

@NgModule({
  declarations: [EtpUnidadeAnaliseComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TableModule,
    PrincipalModule,
    AutoCompleteModule,
  ],
  exports: [EtpUnidadeAnaliseComponent],
})
export class EtpUnidadeAnaliseModule {}
