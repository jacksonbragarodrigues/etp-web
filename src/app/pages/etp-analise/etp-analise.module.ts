import {
  InputSearchFormComponent,
  TableModule,
} from '@administrativo/components';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormioModule } from '@formio/angular';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { AccordionModule } from 'primeng/accordion';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToastModule } from 'primeng/toast';
import { DelegarAcessoModule } from '../delegacao-acesso/gestao-delegacao-acesso/delegar-acesso.module';
import { PrincipalModule } from '../principal/principal.module';
import { EtpAnaliseRoutingModule } from './etp-analise-routing.module';
import { GestaoEtpAnaliseComponent } from './gestao-etp-analise/gestao-etp-analise.component';
import { FormularioEtpAnaliseComponent } from './modal/formulario-etp-analise/formulario-etp-analise.component';
import { EtpModule } from '../etp/etp.module';
import {FichaAnaliseComponent} from "./modal/ficha-analise/ficha-analise.component";
import { AutoCompleteModule } from 'primeng/autocomplete';
import {CheckboxModule} from "primeng/checkbox";
import {SelecionarAnalistaComponent} from "./modal/ficha-analise/selecionar-analista/selecionar-analista.component";

@NgModule({
  declarations: [
    GestaoEtpAnaliseComponent,
    FormularioEtpAnaliseComponent,
    FichaAnaliseComponent,
    SelecionarAnalistaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
    TableModule,
    FormioModule,
    EtpAnaliseRoutingModule,
    NgxMaskDirective,
    NgxMaskPipe,
    PrincipalModule,
    ToastModule,
    MenuModule,
    OverlayPanelModule,
    PanelMenuModule,
    AutoCompleteModule,
    AccordionModule,
    MenubarModule,
    InputSearchFormComponent,
    DelegarAcessoModule,
    EtpModule,
    CheckboxModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
    TableModule,
    FormioModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EtpAnaliseModule {}
