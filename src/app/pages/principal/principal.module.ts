import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrincipalComponent } from './principal.component';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuLateralModule, TableModule } from '@administrativo/components';
import { TabelaSortableHeader } from 'src/app/shared/tables/table-sortable';
import { GestaoFormularioComponent } from '../formulario/gestao-formulario/gestao-formulario.component';
import { ModalCadastrarFormularioComponent } from '../formulario/modal/modal-cadastrar-formulario/modal-cadastrar-formulario.component';
import { ErrorMensageComponent } from 'src/app/shared/error-mensage/error-mensage.component';
import { FormioModule } from '@formio/angular';
import { ModalConstruirFormularioComponent } from '../formulario/modal/modal-construir-formulario/modal-construir-formulario.component';
import { TemplateHtmlComponent } from '../formulario/modal/modal-construir-formulario/template-html/template-html.component';
import { PrincipalRoutingModule } from './principal-routing.module';
import { PesquisarSharedFormularioComponent } from 'src/app/shared/pesquisar-shared-formulario/pesquisar-shared-formulario.component';
import { TableSharedFormularioComponent } from 'src/app/shared/table-shared-formulario/table-shared-formulario.component';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CompararHtmlComponent } from '../formulario/modal/comparar-html/comparar-html.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'; // <-- Import PdfJsViewerModule module
import { PanelMenuModule } from 'primeng/panelmenu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';
import { ForceUppercaseDirective } from 'src/app/shared/directive/force-uppercase-directive';
import { EnvioSeiComponent } from '../etp/gestao-etp/modal/envio-sei/envio-sei.component';
import { ModalVersoesFormularioComponent } from '../formulario/modal/modal-versoes-formulario/modal-versoes-formulario.component';
import { TableSharedFormComponent } from '../formulario/shared/table-shared-form/table-shared-form.component';
import { VersionarFormularioComponent } from '../formulario/modal/versionar-formulario/versionar-formulario.component';
import { MenubarModule } from 'primeng/menubar';
import { DelegarAcessoModule } from '../delegacao-acesso/gestao-delegacao-acesso/delegar-acesso.module';
import { FormBuilderLibModule } from 'form-builder-lib';

@NgModule({
  declarations: [
    PrincipalComponent,
    TabelaSortableHeader,
    GestaoFormularioComponent,
    ModalCadastrarFormularioComponent,
    TemplateHtmlComponent,
    ModalConstruirFormularioComponent,
    ModalVersoesFormularioComponent,
    ErrorMensageComponent,
    PesquisarSharedFormularioComponent,
    TableSharedFormularioComponent,
    CompararHtmlComponent,
    EnvioSeiComponent,
    ForceUppercaseDirective,
    TableSharedFormComponent,
    VersionarFormularioComponent,
  ],
  imports: [
    FormBuilderLibModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    PrincipalRoutingModule,
    NgbModule,
    TableModule,
    FormioModule,
    DropdownModule,
    CalendarModule,
    PdfJsViewerModule,
    MenuLateralModule,
    OverlayPanelModule,
    PanelMenuModule,
    MultiSelectModule,
    MenubarModule,
    DelegarAcessoModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
    TableModule,
    ErrorMensageComponent,
    PesquisarSharedFormularioComponent,
    TableSharedFormularioComponent,
    TemplateHtmlComponent,
    ForceUppercaseDirective,
    FormioModule,
    DropdownModule,
    CalendarModule,
    MenuLateralModule,
    EnvioSeiComponent,
    MultiSelectModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
})
export class PrincipalModule {}
