import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, ApplicationRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilderService } from '../../services/form-builder.service';
import { ValidationService, ValidationError } from '../../services/validation.service';
import { HelpContentService, HelpContent } from '../../services/help-content.service';
import { ReportService } from '../../services/report.service';
import { FormBuilderState, FormStep, FormComponent, ComponentType } from '../../models/form-builder.models';
import { FormCanvasComponent } from '../form-canvas/form-canvas.component';
import { StepsWizardComponent } from '../steps-wizard/steps-wizard.component';
import { ComponentPaletteComponent } from '../component-palette/component-palette.component';
import { PropertiesPanelComponent } from '../properties-panel/properties-panel.component';
import { AnnotationsModalComponent, AnnotationRow } from '../annotations-modal/annotations-modal.component';
import { CustomCKEditorComponent } from '../custom-ckeditor/custom-ckeditor.component';
import { CkEditorModalComponent } from '../ck-editor-modal/ck-editor-modal.component';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StepsWizardComponent,
    ComponentPaletteComponent,
    FormCanvasComponent,
    PropertiesPanelComponent,
    AnnotationsModalComponent,
    CustomCKEditorComponent,
    CkEditorModalComponent
  ],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(FormCanvasComponent) formCanvasComponent!: FormCanvasComponent;
  @ViewChild('annotationsModal') annotationsModal!: AnnotationsModalComponent;
  @ViewChild('ckEditorModal') ckEditorModal!: CkEditorModalComponent;

  state: FormBuilderState = {
    currentStep: '',
    selectedComponent: null,
    selectedStep: null,
    formSchema: {
      id: '',
      name: '',
      steps: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    },
    previewMode: false,
    analysisMode: false,
    dragInProgress: false
  };

  private destroy$ = new Subject<void>();

  // Track last emitted JSON snapshots to avoid redundant emissions
  private lastFormJsonEmitted: string | null = null;
  private lastDataJsonEmitted: string | null = null;
  private lastAnalysisJsonEmitted: string | null = null;

  // Track last imported inputs to avoid unnecessary re-imports
  private lastImportedFormJson: string | null = null;
  private lastImportedDataJson: string | null = null;

  // Help content management
  currentHelpContent: HelpContent | null = null;
  isHelpPanelOpen: boolean = false;

  // Step loading indicator
  isStepLoading: boolean = false;

  // Report management
  isReportPanelOpen: boolean = false;
  currentReportContent: string = '';

  // Annotations/Notes management
  isAnnotationsPanelOpen: boolean = false;
  expandedAnnotations: { [componentId: string]: boolean } = {};
  readonly globalAnalysisId: string = '__analysis__';

  // Library IO control
  @Input() formJson?: string | object | null;
  @Input() dataJson?: string | object | null;
  @Input() analysisJson?: string | object | null;
  @Input() ioEnabled: boolean = false; // show/hide import/export controls

  @Output() formJsonChange = new EventEmitter<string>();
  @Output() dataJsonChange = new EventEmitter<string>();
  @Output() analysisJsonChange = new EventEmitter<string>();

  // Analysis feature state
  activeAnalysisTab: 'lista' | 'nova' = 'lista';
  newAnnTargetId: string = '';
  newAnnType: 'apontamento' | 'observacao' = 'apontamento';
  newAnnResponseType: string = 'nao_informado';
  newAnnInternal: boolean = false;
  newAnnContent: string = '';
  editingAnnComponentId: string | null = null;
  editingAnnId: string | null = null;
  parentAnnId: string | null = null;
  responseTypeOptions: { value: string; label: string }[] = [
    { value: 'nao_informado', label: 'Não Informado' },
    { value: 'ajuste', label: 'Ajuste' },
    { value: 'exigencia', label: 'Exigência' },
    { value: 'comentario', label: 'Comentário' }
  ];

  constructor(
    private formBuilderService: FormBuilderService,
    private validationService: ValidationService,
    private helpContentService: HelpContentService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    console.log(this.dataJson);
    this.formBuilderService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        Promise.resolve().then(() => this.emitOutputs());
        this.cdr.markForCheck();
      });

    // Subscribe to help content changes
    this.helpContentService.helpContent$
      .pipe(takeUntil(this.destroy$))
      .subscribe(helpContent => {
        this.currentHelpContent = helpContent;
      });

    this.helpContentService.isHelpPanelOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isHelpPanelOpen = isOpen;
      });

    // Step loading subscription
    this.formBuilderService.stepLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => { this.isStepLoading = isLoading; this.cdr.markForCheck(); });

    // Apply initial inputs if provided
    this.applyInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formJson']) {
      const val = changes['formJson'].currentValue;
      if (val !== undefined && val !== null) {
        const content = typeof this.formJson === 'string' ? (this.formJson as string) : JSON.stringify(this.formJson);
        // Prevent feedback loop: ignore values we just emitted ourselves
        if (this.lastFormJsonEmitted === content) { return; }
        if (this.lastImportedFormJson === content) { /* no-op */ } else {
          try {
            const obj = JSON.parse(content);
            if (obj && Array.isArray(obj.components)) {
              this.formBuilderService.importFormioSchema(content);
              this.lastImportedFormJson = content;
            } else if (obj && Array.isArray(obj.steps)) {
              this.formBuilderService.importFormSchema(content);
              this.lastImportedFormJson = content;
            }
          } catch {}
        }
      }
    }

    if (changes['dataJson']) {
      const val = changes['dataJson'].currentValue;
      if (val !== undefined && val !== null) {
        const content = typeof this.dataJson === 'string' ? (this.dataJson as string) : JSON.stringify(this.dataJson);
        if (typeof content === 'string' && content.trim() === '') { return; }
        // Prevent feedback loop for data as well
        if (this.lastDataJsonEmitted === content) { return; }
        if (this.lastImportedDataJson === content) { /* no-op */ } else {
          try { JSON.parse(content); this.formBuilderService.importFormData(content); this.lastImportedDataJson = content; } catch {}
        }
      }
    }

    if (changes['analysisJson']) {
      const val = changes['analysisJson'].currentValue;
      if (val !== undefined && val !== null) {
        const content = typeof this.analysisJson === 'string' ? this.analysisJson as string : JSON.stringify(this.analysisJson);
        try {
          this.formBuilderService.importAnalysisData(content);
        } catch {
          try {
            const obj = JSON.parse(content);
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
              const payload = JSON.stringify({ annotations: obj });
              this.formBuilderService.importAnalysisData(payload);
            }
          } catch {}
        }
      }
    }
  }

  private applyInputs(): void {
    if (this.formJson) {
      const content = typeof this.formJson === 'string' ? this.formJson : JSON.stringify(this.formJson);
      try {
        const obj = JSON.parse(content);
        if (obj && Array.isArray(obj.components)) {
          this.formBuilderService.importFormioSchema(content);
          this.lastImportedFormJson = content;
        } else if (obj && Array.isArray(obj.steps)) {
          this.formBuilderService.importFormSchema(content);
          this.lastImportedFormJson = content;
        }
      } catch {
        // ignore invalid
      }
    }
    if (this.dataJson) {
      const content = typeof this.dataJson === 'string' ? this.dataJson : JSON.stringify(this.dataJson);
      this.formBuilderService.importFormData(content);
      this.lastImportedDataJson = content;
    }
    if (this.analysisJson) {
      const content = typeof this.analysisJson === 'string' ? this.analysisJson : JSON.stringify(this.analysisJson);
      try {
        // Accept either direct annotations map or wrapped { annotations }
        this.formBuilderService.importAnalysisData(content);
      } catch {
        try {
          const obj = JSON.parse(content);
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            const payload = JSON.stringify({ annotations: obj });
            this.formBuilderService.importAnalysisData(payload);
          }
        } catch {}
      }
    }
  }

  private emitOutputs(): void {
    try {
      const form = this.formBuilderService.exportFormSchema();
      const data = this.formBuilderService.exportFormData();
      const analysis = this.formBuilderService.exportAnalysisData();

      // Emit only when content actually changes to prevent feedback loops
      if (this.lastFormJsonEmitted !== form) {
        this.lastFormJsonEmitted = form;
        this.formJsonChange.emit(form);
      }
      if (this.lastDataJsonEmitted !== data) {
        this.lastDataJsonEmitted = data;
        this.dataJsonChange.emit(data);
      }
      if (this.lastAnalysisJsonEmitted !== analysis) {
        this.lastAnalysisJsonEmitted = analysis;
        this.analysisJsonChange.emit(analysis);
      }
    } catch {}
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTogglePreview(): void {
    const newPreviewMode = !this.state.previewMode;
    this.formBuilderService.updateState({
      previewMode: newPreviewMode,
      analysisMode: false
    });

    if (newPreviewMode) {
      setTimeout(() => {
        this.formBuilderService.updateAllValidation();
      }, 0);
    } else {
      if (this.formCanvasComponent) {
        this.formCanvasComponent.hideValidationErrors();
      }
    }
  }

  onToggleAnalysis(): void {
    const newAnalysisMode = !this.state.analysisMode;
    this.formBuilderService.updateState({
      analysisMode: newAnalysisMode,
      previewMode: false
    });
    if (newAnalysisMode) {
      const items = this.buildNumberedItems();
      this.newAnnTargetId = items.length ? items[0].component.id : '';
      this.activeAnalysisTab = 'lista';
    }
  }

  onExportForm(): void {
    const exported = this.formBuilderService.exportFormSchema();
    this.downloadFile(exported, 'form-schema.json', 'application/json');
  }

  onImportForm(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const obj = JSON.parse(content);
          if (obj && Array.isArray(obj.components)) {
            // Form.io schema: converter e anexar steps sem apagar os existentes
            this.formBuilderService.importFormioSchema(content);
            alert('Formulário (Form.io) importado e anexado como novo step.');
          } else if (obj && Array.isArray(obj.steps)) {
            // Schema nativo desta app
            this.formBuilderService.importFormSchema(content);
            alert('Formulário importado com sucesso.');
          } else {
            alert('JSON inválido: estrutura não reconhecida.');
          }

          // Re-inicializa a aba de análise após importação sem atraso para evitar corrida com cliques
          if (this.state.analysisMode) {
            const items = this.buildNumberedItems();
            this.newAnnTargetId = items.length ? items[0].component.id : '';
            // Não alterar a aba ativa aqui para evitar sobrescrever cliques em "+ Novo"
            this.cdr.detectChanges();
          }
        } catch (err) {
          console.error('Erro ao importar formulário:', err);
          alert('Erro ao importar: JSON inválido');
        }
      };
      reader.readAsText(file);
    }
  }

  // ========== MÉTODOS PARA GERENCIAR DADOS SEPARADOS DA ESTRUTURA ==========

  onExportData(): void {
    try {
      const exportedData = this.formBuilderService.exportFormData();
      this.downloadFile(exportedData, 'form-data.json', 'application/json');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados do formulário');
    }
  }

  onDebugExportData(): void {
    try {
      console.log('=== Debug Export Data ===');
      const debugResult = this.formBuilderService.debugExportFormData();

      // Especificamente verificar DataGrids
      const dataGridComponents = this.findDataGridComponents();
      console.log('DataGrid components found:', dataGridComponents.length);

      dataGridComponents.forEach(comp => {
        console.log(`DataGrid "${comp.label}" (${comp.key}):`, {
          hasRows: comp.rows ? comp.rows.length : 0,
          hasValue: comp.value ? comp.value.length : 0,
          inExportedData: debugResult.data[comp.key] ? debugResult.data[comp.key].length : 'NOT FOUND',
          rows: comp.rows,
          value: comp.value,
          exportedValue: debugResult.data[comp.key]
        });
      });

      console.log('Debug export completed. Check console for details.');
      alert('Debug export executado! Verifique o console para detalhes.');
    } catch (error) {
      console.error('Erro no debug export:', error);
      alert('Erro no debug export: ' + error);
    }
  }

  private findDataGridComponents(): any[] {
    const dataGrids: any[] = [];

    this.state.formSchema.steps.forEach(step => {
      this.findDataGridsInComponents(step.components, dataGrids);
    });

    return dataGrids;
  }

  private findDataGridsInComponents(components: any[], dataGrids: any[]): void {
    components.forEach(component => {
      if (component.type === 'datagrid') {
        dataGrids.push(component);
      }

      if (component.children) {
        this.findDataGridsInComponents(component.children, dataGrids);
      }
    });
  }

  onImportData(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          this.formBuilderService.importFormData(content);
          alert('Dados importados com sucesso!');
        } catch (error) {
          console.error('Erro ao importar dados:', error);
          alert('Erro ao importar dados: verifique se o arquivo está no formato correto');
        }
      };
      reader.readAsText(file);
    }

    // Reset input value para permitir reimportar o mesmo arquivo
    input.value = '';
  }

  onClearData(): void {
    if (confirm('Tem certeza que deseja limpar todos os dados digitados? Esta ação não pode ser desfeita.')) {
      this.formBuilderService.clearFormData();
      alert('Dados limpos com sucesso!');
    }
  }

  // ========== ANÁLISE: Export/Import somente das anotações/comentários ==========
  onExportAnalysis(): void {
    try {
      const exported = this.formBuilderService.exportAnalysisData();
      this.downloadFile(exported, 'analysis-data.json', 'application/json');
    } catch (error) {
      console.error('Erro ao exportar análise:', error);
      alert('Erro ao exportar dados da análise');
    }
  }

  onImportAnalysis(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        this.formBuilderService.importAnalysisData(content);
        // Se já estivermos na análise, atualiza seleção padrão
        if (this.state.analysisMode) {
          const items = this.buildNumberedItems();
          this.newAnnTargetId = items.length ? items[0].component.id : '';
          this.cdr.detectChanges();
        }
        alert('Dados da análise importados com sucesso!');
      } catch (err) {
        console.error('Erro ao importar análise:', err);
        alert('Erro ao importar dados da análise: verifique o arquivo');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  getCurrentStepComponentsCount(): number {
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    return currentStep?.components?.length || 0;
  }

  getSelectedComponentLabel(): string {
    return this.state.selectedComponent?.label || this.state.selectedComponent?.type || '';
  }

  getStepsCount(): number {
    return this.state.formSchema.steps.length;
  }

  getCurrentStepLabel(): string {
    if (!this.state.currentStep) return '';
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    return currentStep?.title || '';
  }

  // Preview Mode Navigation Methods
  onPreviewStepPress(stepId: string, event?: Event): void {
    if (event && typeof (event as any).preventDefault === 'function') (event as any).preventDefault();

    this.formBuilderService.setStepLoading(true);

    if (this.state.currentStep === stepId) {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => requestAnimationFrame(() => this.formBuilderService.setStepLoading(false)));
      } else {
        setTimeout(() => this.formBuilderService.setStepLoading(false), 50);
      }
      return;
    }

    const switchStep = () => {
      this.formBuilderService.setCurrentStep(stepId);
      // Hide validation errors when navigating via menu
      if (this.state.previewMode && this.formCanvasComponent) {
        this.formCanvasComponent.hideValidationErrors();
      }
      // Wait for Angular to become stable before hiding overlay
      const sub = this.appRef.isStable.subscribe(stable => {
        if (stable) {
          this.formBuilderService.setStepLoading(false);
          sub.unsubscribe();
        }
      });
      // Safety fallback
      setTimeout(() => this.formBuilderService.setStepLoading(false), 1500);
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => switchStep());
    } else {
      setTimeout(() => switchStep(), 0);
    }
  }

  getCurrentStepIndex(): number {
    const steps = this.state.formSchema.steps;
    return steps.findIndex(step => step.id === this.state.currentStep);
  }

  canGoPrevious(): boolean {
    return this.getCurrentStepIndex() > 0;
  }

  canGoNext(): boolean {
    return this.getCurrentStepIndex() < this.state.formSchema.steps.length - 1;
  }

  isLastStep(): boolean {
    return this.getCurrentStepIndex() === this.state.formSchema.steps.length - 1;
  }

  onPreviousStep(): void {
    const currentIndex = this.getCurrentStepIndex();
    if (currentIndex > 0) {
      const previousStep = this.state.formSchema.steps[currentIndex - 1];
      this.onPreviewStepPress(previousStep.id);
    }
  }

  onNextStep(): void {
    if (this.state.previewMode && this.formCanvasComponent) {
      const validationErrors = this.formCanvasComponent.validateCurrentStep();
      if (validationErrors.length > 0) {
        this.validationService.expandPanelsWithErrors(validationErrors);
        this.formCanvasComponent.showValidationErrorsForCurrentStep();
        return;
      } else {
        this.formCanvasComponent.hideValidationErrors();
      }
    }

    const currentIndex = this.getCurrentStepIndex();
    if (currentIndex < this.state.formSchema.steps.length - 1) {
      const nextStep = this.state.formSchema.steps[currentIndex + 1];
      this.onPreviewStepPress(nextStep.id);
    }
  }

  onClosePreview(): void {
    this.formBuilderService.updateState({ previewMode: false });
  }

  onCloseAnalysis(): void {
    this.formBuilderService.updateState({ analysisMode: false });
  }

  private downloadFile(content: string, fileName: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Métodos de validação para o preview
  isStepValid(step: FormStep): boolean {
    return step.valid !== false;
  }

  getValidationIcon(step: FormStep): string {
    return this.isStepValid(step) ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger';
  }

  shouldShowValidationIcon(step: FormStep): boolean {
    // Mostrar ícone apenas no preview mode e se o step tem componentes
    return this.state.previewMode && step.components && step.components.length > 0;
  }

  onCloseHelpPanel(): void {
    this.helpContentService.hideHelpContent();
  }

  onOpenHelpInNewTab(): void {
    const help = this.currentHelpContent;
    if (!help) return;

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${help.title ? this.escapeHtml(help.title) : 'Ajuda'}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
<style>
  body { padding: 16px; }
  .help-container { max-width: 800px; margin: 0 auto; }
  .help-container img { max-width: 100%; height: auto; display: block; margin: 8px auto; }
</style>
</head>
<body>
  <div class="help-container">
    <h5 class="mb-3 text-primary">${help.title ? this.escapeHtml(help.title) : 'Ajuda'}</h5>
    <div>${help.content || ''}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ========== ANÁLISE: Right panel actions ==========

  getAllAnnotationsList(): { id: string; status?: string; componentId: string; type: string; responseType?: string; content: string; number: string; label: string }[] {
    const map = this.formBuilderService.getAnnotations();
    const items = this.buildNumberedItems();
    const byId = new Map(items.map(i => [i.component.id, i] as const));
    const out: { id: string; status?: string; componentId: string; type: string; responseType?: string; content: string; number: string; label: string }[] = [];
    Object.keys(map || {}).forEach(cid => {
      const item = byId.get(cid);
      const num = item ? item.number : '';
      const label = item ? (item.component.label || this.getComponentTypeLabel(item.component.type as any)) : '';
      (map[cid] || []).forEach((e: any) => out.push({ id: e.id, status: e.status, componentId: cid, type: e.type, responseType: e.responseType, content: e.content, number: num, label }));
    });
    return out;
  }

  addAnnotationFromForm(): void {
    if (!this.newAnnTargetId) return;

    if (this.editingAnnComponentId && this.editingAnnId) {
      this.formBuilderService.updateAnnotation(this.editingAnnComponentId, this.editingAnnId, {
        type: this.newAnnType,
        responseType: this.newAnnResponseType,
        content: this.newAnnContent,
        internalNote: this.newAnnInternal
      });
      this.editingAnnComponentId = null;
      this.editingAnnId = null;
      this.parentAnnId = null;
    } else if (this.parentAnnId) {
      this.formBuilderService.addObservation(this.newAnnTargetId, this.parentAnnId, this.newAnnContent, this.newAnnResponseType);
      // addObservation defaults internalNote to false in service
      this.parentAnnId = null;
    } else {
      const entry = { type: this.newAnnType, responseType: this.newAnnResponseType, content: this.newAnnContent, internalNote: this.newAnnInternal } as any;
      this.formBuilderService.addAnnotation(this.newAnnTargetId, entry);
    }

    this.newAnnContent = '';
    this.newAnnInternal = false;
    this.activeAnalysisTab = 'lista';
  }

  // ========== ANOTAÇÕES: UI ACTIONS ==========

  onOpenAnnotationsPanel(): void {
    const html = this.generateAnnotationsHTML();
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
    this.isAnnotationsPanelOpen = false;
    this.isReportPanelOpen = false;
  }

  onCloseAnnotationsPanel(): void {
    this.isAnnotationsPanelOpen = false;
  }

  private generateAnnotationsHTML(): string {
    const title = (this.state.formSchema.name || 'Formulário') + ' - Apontamentos e Notas';
    const items = this.buildNumberedItems();

    const sections = items.map((item, i, arr) => {
      const stepChanged = i === 0 || arr[i - 1].stepNumber !== item.stepNumber;
      const stepHeader = stepChanged ? `
        <div class="outer-section mb-2">
          <div class="outer-header">${item.stepNumber} - ${this.state.formSchema.steps[item.stepNumber - 1]?.title || ''}</div>
        </div>` : '';

      const annotations = this.getComponentAnnotations(item.component.id) || [];
      const annCount = annotations.length;
      const annList = annCount === 0
        ? '<div class="text-muted small">Nenhum registro.</div>'
        : annotations.map((ann: any, idx: number) => `
            <div class="border rounded p-2 mb-2 bg-white">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <span class="badge ${ann.type === 'apontamento' ? 'text-bg-primary' : 'text-bg-secondary'}">${ann.type === 'apontamento' ? 'Apontamento' : 'Observação'}</span>
                  <small class="text-muted ms-2">#${idx + 1}</small>
                </div>
              </div>
              <div class="small">${ann.content || ''}</div>
            </div>`).join('');

      const valueHtml = item.component.type !== 'datagrid'
        ? `<div class=\"text-muted small\"><span class=\"conteudo\">${this.getComponentDisplayValue(item.component)}</span></div>`
        : `<div class=\"mt-2\"><table class=\"table table-sm table-bordered\" style=\"margin-left: 40px; max-width: 650px;\"><tbody>${(item.component.rows || []).map(r => `<tr><td>${this.escapeHtml(JSON.stringify(r?.data || {}))}</td></tr>`).join('')}</tbody></table></div>`;

      return `${stepHeader}
      <article class=\"inner-section small-number mb-2\">
        <div class=\"d-flex justify-content-between align-items-start\">
          <div class=\"me-2\">
            <div class=\"fw-semibold\">${item.number} - ${item.component.label || this.getComponentTypeLabel(item.component.type)}</div>
            ${valueHtml}
          </div>
        </div>
        <div class=\"mt-2\">
          <div class=\"fw-semibold small\">Apontamentos e notas (${annCount})</div>
          ${annList}
        </div>
      </article>`;
    }).join('\n');

    const styles = `
      <style>
        body { padding: 16px; font-family: Arial, sans-serif; }
        .outer-header { border: 1px solid #000; background:#f8f9fa; padding:6px 10px; margin: 6px 0; min-width: 760px; max-width: 760px; }
        .inner-section { border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; background:#fff; margin-bottom: 10px; max-width: 760px; }
        .table { width: auto; }
        .conteudo { white-space: pre-wrap; }
      </style>`;

    return `<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>${this.escapeHtml(title)}</title>${styles}</head><body><h5>${this.escapeHtml(this.state.formSchema.name || 'Formulário')}</h5>${sections}</body></html>`;
  }

  onToggleAnnotationsAccordion(componentId: string): void {
    this.expandedAnnotations[componentId] = !this.expandedAnnotations[componentId];
  }

  onClickNewGlobal(): void {
    this.newAnnTargetId = this.globalAnalysisId;
    this.newAnnType = 'apontamento';
    this.newAnnResponseType = 'nao_informado';
    this.newAnnContent = '';
    this.newAnnInternal = false;
    this.editingAnnComponentId = null;
    this.editingAnnId = null;
    this.parentAnnId = null;
    this.activeAnalysisTab = 'nova';
    this.cdr.detectChanges();
  }

  onClickNewForItem(component: FormComponent): void {
    this.newAnnTargetId = component.id;
    this.newAnnType = 'apontamento';
    this.newAnnResponseType = 'nao_informado';
    this.newAnnContent = '';
    this.newAnnInternal = false;
    this.editingAnnComponentId = null;
    this.editingAnnId = null;
    this.parentAnnId = null;
    this.activeAnalysisTab = 'nova';
    this.cdr.detectChanges();
    setTimeout(() => this.scrollToComponentCenter(component.id), 0);
  }

  setAnnotationStatus(componentId: string, entryId: string, status: 'normal' | 'pendente' | 'resolvido' | 'confirmado' | 'cancelado'): void {
    this.formBuilderService.updateAnnotationStatus(componentId, entryId, status);
  }

  editAnnotation(componentId: string, ann: any): void {
    this.newAnnTargetId = componentId;
    this.newAnnType = ann.type;
    this.newAnnResponseType = ann.responseType || 'nao_informado';
    this.newAnnContent = ann.content || '';
    this.newAnnInternal = !!ann.internalNote;
    this.editingAnnComponentId = componentId;
    this.editingAnnId = ann.id;
    this.parentAnnId = null;
    this.activeAnalysisTab = 'nova';
    this.cdr.detectChanges();
  }

  addObservationFor(componentId: string, ann: any): void {
    this.newAnnTargetId = componentId;
    this.newAnnType = 'observacao';
    this.newAnnResponseType = ann.responseType || 'nao_informado';
    this.newAnnContent = '';
    this.newAnnInternal = false;
    this.editingAnnComponentId = null;
    this.editingAnnId = null;
    this.parentAnnId = ann.id;
    this.activeAnalysisTab = 'nova';
    this.cdr.detectChanges();
  }

  openEditorModalForNew(): void {
    if (!this.ckEditorModal) return;
    this.ckEditorModal.open(this.newAnnContent, (content: string) => {
      this.newAnnContent = content;
    });
  }

  scrollToComponentCenter(componentId: string): void {
    const el = document.getElementById('center-item-' + componentId);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  getNewTabTitle(): string {
    if (this.editingAnnId) return this.newAnnType === 'observacao' ? 'Editar Comentário' : 'Editar Anotação';
    if (this.parentAnnId || this.newAnnType === 'observacao') return 'Novo Comentário';
    if (this.activeAnalysisTab === 'nova') return 'Nova Anotação';
    return 'Nova';
  }

  showNewTab(): boolean {
    return this.activeAnalysisTab === 'nova' || !!this.editingAnnId || !!this.parentAnnId;
  }

  onDeleteAnnotation(component: FormComponent | string, entryId: string): void {
    const componentId = typeof component === 'string' ? component : component.id;
    this.formBuilderService.removeAnnotation(componentId, entryId);
  }

  getComponentAnnotations(componentId: string): any[] {
    return this.formBuilderService.getAnnotationsForComponent(componentId);
  }

  getTopLevelAnnotations(componentId: string): any[] {
    return this.getComponentAnnotations(componentId).filter(a => !a.parentId);
  }

  getChildAnnotations(componentId: string, parentId: string): any[] {
    return this.getComponentAnnotations(componentId).filter(a => a.parentId === parentId);
  }

  onAddApontamento(component: FormComponent): void {
    const existing = this.formBuilderService.getAnnotationsForComponent(component.id) as AnnotationRow[];
    this.annotationsModal.open(component.id, existing, 'apontamento', (rows: AnnotationRow[]) => {
      this.formBuilderService.setAnnotationsForComponent(component.id, rows);
    });
  }

  onAddObservacao(component: FormComponent): void {
    const existing = this.formBuilderService.getAnnotationsForComponent(component.id) as AnnotationRow[];
    this.annotationsModal.open(component.id, existing, 'observacao', (rows: AnnotationRow[]) => {
      this.formBuilderService.setAnnotationsForComponent(component.id, rows);
    });
  }

  onEditAnnotations(component: FormComponent): void {
    const existing = this.formBuilderService.getAnnotationsForComponent(component.id) as AnnotationRow[];
    this.annotationsModal.open(component.id, existing, undefined, (rows: AnnotationRow[]) => {
      this.formBuilderService.setAnnotationsForComponent(component.id, rows);
    });
  }

  private shouldIncludeStep(step: FormStep): boolean {
    if (step.properties?.invisible) return false;
    if (step.properties?.conditional && step.properties.conditional.when) {
      return this.evaluateStepConditional(step.properties.conditional);
    }
    return true;
  }

  private evaluateStepConditional(conditional: any): boolean {
    if (!conditional?.when) return true;
    let watchedIds: string[] = [];
    if (Array.isArray(conditional.when)) {
      watchedIds = conditional.when.filter((id: any) => id && String(id).trim());
    } else if (conditional.when && String(conditional.when).trim()) {
      watchedIds = [String(conditional.when).trim()];
    }
    if (watchedIds.length === 0) return true;
    const primaryId = watchedIds[0];
    const val = String(this.formBuilderService.getComponentValueById(primaryId));
    const expected = Array.isArray(conditional.eq) ? conditional.eq.map((v: any) => String(v)) : [String(conditional.eq)];
    const actuals = val.includes(',') ? val.split(',').map((v: string) => v.trim()) : [val];
    const met = actuals.some(v => expected.includes(v));
    const show = typeof conditional.show === 'string' ? (conditional.show === 'true') : !!conditional.show;
    return show ? met : !met;
  }

  private shouldIncludeComponent(component: FormComponent): boolean {
    if ((component as any).type === ComponentType.TEXT_HELP) return false;
    return this.validationService.isComponentValidatable(component, this.formBuilderService);
  }

  private isContainerComponent(component: FormComponent): boolean {
    return [ComponentType.PANEL, ComponentType.COLUMNS].includes((component as any).type);
  }

  getComponentTypeLabel(type: ComponentType): string {
    const typeLabels: { [key: string]: string } = {
      [ComponentType.INPUT]: 'Campo de Texto',
      [ComponentType.TEXTAREA]: 'Área de Texto',
      [ComponentType.SELECT]: 'Seleção',
      [ComponentType.SELECT_BOX]: 'Caixa de Seleção',
      [ComponentType.CHECKBOX]: 'Caixa de Verificação',
      [ComponentType.RADIO]: 'Botão de Opção',
      [ComponentType.DATE]: 'Data',
      [ComponentType.FILE]: 'Arquivo',
      [ComponentType.NUMBER]: 'Número',
      [ComponentType.EMAIL]: 'E-mail',
      [ComponentType.RICH_TEXT]: 'Texto Rico',
      [ComponentType.PANEL]: 'Painel',
      [ComponentType.COLUMNS]: 'Colunas',
      [ComponentType.DATAGRID]: 'Grade de Dados',
      [ComponentType.SELECT_API]: 'Seleção API'
    } as any;
    return typeLabels[type] || String(type);
  }

  getComponentDisplayValue(component: FormComponent): string {
    if ((component as any).value === undefined || (component as any).value === null) return '';
    switch ((component as any).type) {
      case ComponentType.SELECT:
      case ComponentType.RADIO:
        if ((component as any).properties.options) {
          const selectedOption = (component as any).properties.options.find((opt: any) => opt.value == (component as any).value);
          return selectedOption ? selectedOption.label : (component as any).value;
        }
        return (component as any).value;
      case ComponentType.SELECT_BOX:
        if ((component as any).properties.multiple && Array.isArray((component as any).value)) {
          if ((component as any).properties.options) {
            const selectedLabels = (component as any).value.map((val: any) => {
              const option = (component as any).properties.options!.find((opt: any) => opt.value == val);
              return option ? option.label : val;
            });
            return selectedLabels.join(', ');
          }
          return (component as any).value.join(', ');
        } else {
          if ((component as any).properties.options) {
            const selectedOption = (component as any).properties.options.find((opt: any) => opt.value == (component as any).value);
            return selectedOption ? selectedOption.label : (component as any).value;
          }
          return (component as any).value;
        }
      case ComponentType.CHECKBOX:
        if ((component as any).properties.options && (component as any).properties.options.length > 0) {
          const selectedOptions = (component as any).properties.options.filter((opt: any) => opt.selected);
          return selectedOptions.map((opt: any) => opt.label).join(', ');
        } else {
          return (component as any).value ? 'Sim' : 'Não';
        }
      case ComponentType.FILE:
        if (Array.isArray((component as any).value)) {
          return (component as any).value.map((file: any) => file.name || file).join(', ');
        }
        return (component as any).value.name || (component as any).value;
      case ComponentType.DATE:
        if ((component as any).value) {
          const date = new Date((component as any).value);
          return date.toLocaleDateString('pt-BR');
        }
        return '';
      case ComponentType.RICH_TEXT:
        return String((component as any).value).replace(/<[^>]*>/g, '');
      default:
        return String((component as any).value);
    }
  }

  buildNumberedItems() {
    const items: { stepNumber: number; number: string; component: FormComponent; depth: number }[] = [];

    this.state.formSchema.steps.forEach((step, sIdx) => {
      if (!this.shouldIncludeStep(step)) return;
      const componentNumbers: number[] = [0];

      const getNumber = (depth: number) => {
        if (depth === 0) return `${sIdx + 1}.${componentNumbers[0]}`;
        return `${sIdx + 1}.${componentNumbers.slice(0, depth + 1).join('.')}`;
      };

      const visit = (comp: FormComponent, depth: number) => {
        if (!this.shouldIncludeComponent(comp)) return;

        if (comp.properties?.hideLabel) {
          if (this.isContainerComponent(comp) && comp.children && comp.children.length) {
            comp.children.forEach(child => visit(child, depth));
          }
          return;
        }

        if (componentNumbers.length <= depth) {
          componentNumbers.push(1);
        } else {
          componentNumbers[depth]++;
          componentNumbers.splice(depth + 1);
        }

        const num = getNumber(depth);
        items.push({ stepNumber: sIdx + 1, number: num, component: comp, depth });

        if (this.isContainerComponent(comp) && comp.children && comp.children.length) {
          comp.children.forEach(child => visit(child, depth + 1));
        }
      };

      step.components.forEach(c => visit(c, 0));
    });

    return items;
  }

  // ========== MÉTODOS PARA GERENCIAR RELATÓRIO ==========

  onGenerateReport(): void {
    try {
      this.currentReportContent = this.reportService.generateHTMLReport();
      this.isReportPanelOpen = false;
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.open();
        reportWindow.document.write(this.currentReportContent);
        reportWindow.document.close();
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório: ' + error);
    }
  }

  onGenerateAnalysisReportFull(): void {
    try {
      const html = this.reportService.generateHTMLReportWithAnnotations('full');
      const win = window.open('', '_blank');
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
      }
    } catch (error) {
      console.error('Erro ao gerar relatório completo com anotações:', error);
      alert('Erro ao gerar relatório completo com anotações');
    }
  }

  onGenerateAnalysisReportSummary(): void {
    try {
      const html = this.reportService.generateHTMLReportWithAnnotations('summary');
      const win = window.open('', '_blank');
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
      }
    } catch (error) {
      console.error('Erro ao gerar relatório resumido com anotações:', error);
      alert('Erro ao gerar relatório resumido com anotações');
    }
  }

  onCloseReportPanel(): void {
    this.isReportPanelOpen = false;
    this.currentReportContent = '';
  }

  onDownloadReport(): void {
    if (!this.currentReportContent) {
      alert('Nenhum relatório foi gerado ainda.');
      return;
    }

    try {
      const formName = this.state.formSchema.name || 'Formulario';
      const fileName = `relatorio-${formName.replace(/\s+/g, '-').toLowerCase()}.html`;
      this.downloadFile(this.currentReportContent, fileName, 'text/html');
    } catch (error) {
      console.error('Erro ao fazer download do relatório:', error);
      alert('Erro ao fazer download do relatório');
    }
  }

  onPrintReport(): void {
    if (!this.currentReportContent) {
      alert('Nenhum relatório foi gerado ainda.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(this.currentReportContent);
      printWindow.document.close();
      printWindow.print();
    }
  }
}
