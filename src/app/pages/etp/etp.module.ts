import {
  InputSearchFormComponent,
  TableModule,
} from '@administrativo/components';
import { CommonModule } from '@angular/common';
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
import { MenuItemContent, MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToastModule } from 'primeng/toast';
import { PrincipalModule } from '../principal/principal.module';
import { EtpRoutingModule } from './etp-routing.module';
import { GestaoEtpComponent } from './gestao-etp/gestao-etp.component';
import { CadastrarEtpComponent } from './gestao-etp/modal/cadastrar-etp/cadastrar-etp.component';
import { CompararHtmlEtpComponent } from './gestao-etp/modal/comparar-html-etp/comparar-html-etp.component';
import { FormularioEtpComponent } from './gestao-etp/modal/formulario-etp/formulario-etp.component';
import { RemoveZerosProcessoSeiPipe } from './shared/remove-zeros-processo-sei-pipe.pipe';
import { VersoesEtpComponent } from './gestao-etp/modal/versoes-etp/versoes-etp.component';
import { TableSharedEtpComponent } from './shared/table-shared-etp/table-shared-etp.component';
import { VersionarComponent } from './gestao-etp/modal/versionar/versionar.component';
import { MenubarModule } from 'primeng/menubar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CompararHtmlEtpNovaVersaoComponent } from './gestao-etp/modal/comparar-html-etp-nova-versao/comparar-html-etp-nova-versao.component';
import { DelegarAcessoModule } from '../delegacao-acesso/gestao-delegacao-acesso/delegar-acesso.module';
import { ListarLogsEtpComponent } from './gestao-etp/modal/listar-logs-etp/listar-logs-etp.component';

const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  declarations: [
    GestaoEtpComponent,
    CadastrarEtpComponent,
    FormularioEtpComponent,
    CompararHtmlEtpComponent,
    RemoveZerosProcessoSeiPipe,
    VersoesEtpComponent,
    TableSharedEtpComponent,
    VersionarComponent,
    CompararHtmlEtpNovaVersaoComponent,
    ListarLogsEtpComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbModule,
    TableModule,
    FormioModule,
    EtpRoutingModule,
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
  ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbDatepickerModule,
        NgbModule,
        TableModule,
        FormioModule,
        RemoveZerosProcessoSeiPipe,
        CadastrarEtpComponent,
        ListarLogsEtpComponent,
        CompararHtmlEtpComponent,
        CompararHtmlEtpNovaVersaoComponent,
        VersionarComponent,
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [provideNgxMask(maskConfig), MessageService, MenuItemContent],
})
export class EtpModule {}
