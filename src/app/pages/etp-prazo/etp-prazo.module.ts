import { TableModule } from '@administrativo/components';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PrincipalModule } from '../principal/principal.module';
import { EtpPrazoComponent } from './etp-prazo.component';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  declarations: [EtpPrazoComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TableModule,
    PrincipalModule,
    AutoCompleteModule,
  ],
  exports: [EtpPrazoComponent],
})
export class EtpPrazoModule { }
