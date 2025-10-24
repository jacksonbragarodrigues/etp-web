import { NgModule, type Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AnnotationsModalComponent } from '../components/annotations-modal/annotations-modal.component';
import { CkEditorModalComponent } from '../components/ck-editor-modal/ck-editor-modal.component';
import { ComponentPaletteComponent } from '../components/component-palette/component-palette.component';
import { CustomCKEditorComponent } from '../components/custom-ckeditor/custom-ckeditor.component';
import { FormBuilderComponent } from '../components/form-builder/form-builder.component';
import { FormCanvasComponent } from '../components/form-canvas/form-canvas.component';
import { FormComponentRendererComponent } from '../components/form-component-renderer/form-component-renderer.component';
import { PropertiesPanelComponent } from '../components/properties-panel/properties-panel.component';
import { ReportAnalysisFullComponent } from '../components/report-analysis-full/report-analysis-full.component';
import { ReportAnalysisSummaryComponent } from '../components/report-analysis-summary/report-analysis-summary.component';
import { ReportHtmlComponent } from '../components/report-html/report-html.component';
import { StepsWizardComponent } from '../components/steps-wizard/steps-wizard.component';
import { FilterKeysPipe } from '../pipes/filterskey.pipe';
import { FormBuilderService } from '../services/form-builder.service';
import { ValidationService } from '../services/validation.service';
import { HelpContentService } from '../services/help-content.service';
import { ReportService } from '../services/report.service';
import { CustomCKEditorService } from '../services/custom-ckeditor.service';
import { ApiSelectService } from '../services/api-select.service';

const FORM_BUILDER_DECLARATIONS: ReadonlyArray<Type<unknown>> = [
  FormBuilderComponent,
  FormCanvasComponent,
  FormComponentRendererComponent,
  ComponentPaletteComponent,
  PropertiesPanelComponent,
  StepsWizardComponent,
  AnnotationsModalComponent,
  CustomCKEditorComponent,
  CkEditorModalComponent,
  ReportHtmlComponent,
  ReportAnalysisFullComponent,
  ReportAnalysisSummaryComponent,
  FilterKeysPipe
];

const FORM_BUILDER_LIB_PROVIDER_LIST = [
  FormBuilderService,
  ValidationService,
  HelpContentService,
  ReportService,
  CustomCKEditorService,
  ApiSelectService
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...FORM_BUILDER_DECLARATIONS
  ],
  exports: [...FORM_BUILDER_DECLARATIONS],
  providers: FORM_BUILDER_LIB_PROVIDER_LIST
})
export class FormBuilderLibModule {}

export const FORM_BUILDER_LIB_STANDALONE_EXPORTS = FORM_BUILDER_DECLARATIONS;
export const FORM_BUILDER_LIB_PROVIDERS = FORM_BUILDER_LIB_PROVIDER_LIST;
