import {
  InputSearchFormComponent,
} from '@administrativo/components';
import {CommonModule} from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormioModule } from '@formio/angular';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  IConfig,
  NgxMaskDirective,
  NgxMaskPipe,
  provideNgxMask,
} from 'ngx-mask';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DelegarAcessoComponent } from "./delegar-acesso.component";
import { TabViewModule } from "primeng/tabview";
import { TableModule } from "primeng/table";
import { CheckboxModule } from "primeng/checkbox";
import { CalendarModule } from "primeng/calendar";

const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  declarations: [
    DelegarAcessoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
    TableModule,
    FormioModule,
    NgxMaskDirective,
    NgxMaskPipe,
    ToastModule,
    OverlayPanelModule,
    PanelMenuModule,
    AutoCompleteModule,
    AccordionModule,
    InputSearchFormComponent,
    TabViewModule,
    TableModule,
    TableModule,
    CheckboxModule,
    CalendarModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
    TableModule,
    FormioModule,
    DelegarAcessoComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [provideNgxMask(maskConfig), MessageService],
})
export class DelegarAcessoModule {}
