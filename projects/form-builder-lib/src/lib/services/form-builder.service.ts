import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  FormComponent,
  FormStep,
  FormSchema,
  ComponentType,
  ComponentTemplate,
  ComponentCategory,
  TreeNode,
  FormBuilderState,
  ConditionalLogic,
  DataGridRow,
  AnnotationsMap,
  AnnotationEntry
} from '../models/form-builder.models';
import FunctionAux from '../function/functions.aux';
import { ValidationService } from './validation.service';
import { ENVIRONMENTER } from '../components/config.component';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {

  environmenter: any = inject(ENVIRONMENTER);

  functionAux: FunctionAux = new FunctionAux();

  private stateSubject = new BehaviorSubject<FormBuilderState>({
    currentStep: '',
    selectedComponent: null,
    selectedStep: null,
    formSchema: this.createEmptySchema(),
    previewMode: false,
    analysisMode: false,
    dragInProgress: false,
    annotations: {}
  });

  public state$ = this.stateSubject.asObservable();

  // Step switching loading state
  private stepLoadingSubject = new BehaviorSubject<boolean>(false);
  public stepLoading$ = this.stepLoadingSubject.asObservable();
  setStepLoading(isLoading: boolean): void { this.stepLoadingSubject.next(isLoading); }

  private openPropertiesTabSubject = new Subject<void>();
  public openPropertiesTab$ = this.openPropertiesTabSubject.asObservable();

  private delegationEventSubject = new Subject<any>();
  public delegationEvent$ = this.delegationEventSubject.asObservable();

  private componentTemplates: ComponentTemplate[] = [
    {
      type: ComponentType.INPUT,
      label: 'Campo de Texto',
      icon: 'bi-input-cursor-text',
      category: ComponentCategory.BASIC,
      description: 'Entrada de texto de linha única',
      placeholder: 'Enter text...',
      defaultProperties: {}
    },
    // Custom aliases that behave like INPUT
    {
      type: ComponentType.PROCESSO_SEI,
      label: 'Processo SEI',
      icon: 'bi-input-cursor-text',
      category: ComponentCategory.CUSTOM,
      description: 'Campo de texto para Processo SEI (comportamento igual a Campo de Texto)',
      placeholder: 'Número do processo SEI...',
      defaultProperties: {}
    },
    {
      type: ComponentType.NUMERO_ETP,
      label: 'Número ETP',
      icon: 'bi-input-cursor-text',
      category: ComponentCategory.CUSTOM,
      description: 'Campo de texto para número de ETP (comportamento igual a Campo de Texto)',
      placeholder: 'Número do ETP...',
      defaultProperties: {}
    },
    {
      type: ComponentType.TEXTAREA,
      label: 'Área de Texto',
      icon: 'bi-textarea-resize',
      category: ComponentCategory.BASIC,
      description: 'Entrada de texto multilinha',
      placeholder: 'Enter description...',
      defaultProperties: { rows: 4 }
    },
    {
      type: ComponentType.SELECT,
      label: 'Selecione',
      icon: 'bi-menu-button-wide',
      category: ComponentCategory.BASIC,
      description: 'Lista de Seleção',
      placeholder: '...',
      defaultProperties: {
        options: [
          { value: 'opcao1', label: 'Opção 1' },
          { value: 'opcao2', label: 'Opção 2' },
          { value: 'opcao3', label: 'Opção 3' }
        ]
      }
    },
    {
      type: ComponentType.SELECT_BOX,
      label: 'Selecione a caixa',
      icon: 'bi-ui-checks',
      category: ComponentCategory.BASIC,
      description: 'Lista de caixas de seleção de seleção múltipla com seleção ��nica ou múltipla',
      placeholder: '...',
      defaultProperties: {
        multiple: false,
        options: [
          { value: 'opcao1', label: 'Opção 1' },
          { value: 'opcao2', label: 'Op��ão 2' },
          { value: 'opcao3', label: 'Opção 3' }
        ]
      }
    },
    {
      type: ComponentType.CHECKBOX,
      label: 'Caixa de seleção',
      icon: 'bi-check-square',
      category: ComponentCategory.BASIC,
      description: 'Entrada de caixa de seleção',
      placeholder: '...',
      defaultProperties: {}
    },
    {
      type: ComponentType.RADIO,
      label: 'Botão de Opção',
      icon: 'bi-record-circle',
      category: ComponentCategory.BASIC,
      description: 'Seleção única entre várias op��ões',
      placeholder: '...',
      defaultProperties: {
        options: [
          { value: 'sim', label: 'Sim' },
          { value: 'nao', label: 'Não' }
        ]
      }
    },
    {
      type: ComponentType.DATE,
      label: 'Calendário',
      icon: 'bi-calendar-date',
      category: ComponentCategory.BASIC,
      description: 'Entrada de seleção de data',
      placeholder: '...',
      defaultProperties: {}
    },
    {
      type: ComponentType.FILE,
      label: 'Upload de arquivo',
      icon: 'bi-cloud-upload',
      category: ComponentCategory.BASIC,
      description: 'Entrada de upload de arquivo',
      placeholder: '...',
      defaultProperties: { accept: '*/*' }
    },
    {
      type: ComponentType.NUMBER,
      label: 'Entrada de número',
      icon: 'bi-123',
      category: ComponentCategory.BASIC,
      description: 'Entrada numérica com valida��ão',
      placeholder: '...',
      defaultProperties: { min: 0, max: 100, step: 1 }
    },
    {
      type: ComponentType.EMAIL,
      label: 'Entrada de e-mail',
      icon: 'bi-envelope',
      category: ComponentCategory.BASIC,
      description: 'Entrada de endereço de e-mail com validação',
      placeholder: 'email@example.com',
      defaultProperties: {}
    },
    {
      type: ComponentType.RICH_TEXT,
      label: 'Editor Rico',
      icon: 'bi-text-paragraph',
      category: ComponentCategory.BASIC,
      description: 'Editor de rico com recursos de formatação',
      placeholder: 'Digite o texto...',
      defaultProperties: {

        ckEditorConfig: {
          toolbar: ["findAndReplace",
            "|",
            "heading",
            "|",
            "fontSize",
            "fontFamily",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "insereLinkSei",
            "insereLinkCustom",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "subscript",
            "superscript",
            "removeFormat",
            "|",
            "specialCharacters",
            "uploadImage",
            "imageStyle",
            "resizeImage",
            "insertTable",
            "blockQuote",
            "|",
            "alignment",
            "|",
            "bulletedList",
            "numberedList",
            "outdent",
            "indent",],
          height: 200,
          language: 'pt-br'
        }
      }
    },
    {
      type: ComponentType.PANEL,
      label: 'Painel',
      icon: 'bi-layout-three-columns',
      category: ComponentCategory.LAYOUT,
      description: 'Painel para agrupar componentes',
      placeholder: '...',
      defaultProperties: {
        classes: ['card'],
        collapsible: false,
        initCollapsed: false
      }
    },
    {
      type: ComponentType.COLUMNS,
      label: 'Colunas',
      icon: 'bi-columns-gap',
      category: ComponentCategory.LAYOUT,
      description: 'Layout de grade com múltiplas colunas',
      placeholder: '...',
      defaultProperties: {
        hideLabel: false,
        clearOnHide: false,
        columns: [
          {
            width: 6,
            offset: 0,
            push: 0,
            pull: 0
          },
          {
            width: 6,
            offset: 0,
            push: 0,
            pull: 0
          }
        ]
      }
    },
    {
      type: ComponentType.DATAGRID,
      label: 'Grade de Dados',
      icon: 'bi-table',
      category: ComponentCategory.DATA,
      description: 'Tabela editável com linhas dinâmicas',
      placeholder: '...',
      defaultProperties: {
        tableView: true,
        rowDrafts: false,
        addAnother: 'Adiciona',
        addAnotherPosition: 'bottom',
        reorder: true,
        defaultOpen: true,
        disableAddingRemovingRows: false,
        clearOnHide: false
      }
    },
    {
      type: ComponentType.SELECT_API,
      label: 'Select API',
      icon: 'bi-cloud-download',
      category: ComponentCategory.CUSTOM,
      description: 'Selecione com opções do endpoint externo da API',
      placeholder: '...',
      defaultProperties: {
        multiple: false,
        options: [],
        apiConfig: {
          url: '',
          method: 'GET',
          headers: {},
          token: '',
          labelField: 'name',
          valueField: 'id',
          cache: true,
          cacheTimeout: 30,
        }
      }
    },
    {
      type: ComponentType.TIPO_CONTRATACAO,
      label: 'Tipo de Contratação',
      icon: 'bi-cloud-download',
      category: ComponentCategory.CUSTOM,
      description: 'Seleção API para Tipo de Contratação',
      placeholder: '...',
      defaultProperties: {
        multiple: false,
        options: [],
        apiConfig: {
          url: this.environmenter.apiFormulario + '/etp-tipo-licitacao/lista?limit=' + this.environmenter.formioLimitReturnAPI,
          method: 'GET',
          headers: {},
          token: '',
          labelField: 'descricao',
          valueField: 'chave',
          labelTemplate: '{descricao}',
          requestBody: '',
          cache: true,
          cacheTimeout: 30,
        }
      }
    },
    {
      type: ComponentType.UNIDADE,
      label: 'Unidade',
      icon: 'bi-cloud-download',
      category: ComponentCategory.CUSTOM,
      description: 'Seleção API para Unidade',
      placeholder: '...',
      defaultProperties: {
        multiple: false,
        options: [],
        apiConfig: {
          url: '',
          method: 'GET',
          headers: {},
          token: '',
          labelField: 'name',
          valueField: 'id',
          cache: true,
          cacheTimeout: 30,
        }
      }
    },
    {
      type: ComponentType.SERVIDOR,
      label: 'Servidor',
      icon: 'bi-cloud-download',
      category: ComponentCategory.CUSTOM,
      description: 'Seleção API para Servidor',
      placeholder: '...',
      defaultProperties: {
        multiple: false,
        options: [],
        apiConfig: {
          url: '',
          method: 'GET',
          headers: {},
          token: '',
          labelField: 'nome',
          valueField: 'id',
          labelTemplate: '{matricula} - {nome} - {siglaUnidade}',
          cache: true,
          cacheTimeout: 30,
        }
      }
    },
    {
      type: ComponentType.TEXT_HELP,
      label: 'Text Help',
      icon: 'bi-question-circle',
      category: ComponentCategory.BASIC,
      description: 'Texto de ajuda com formatação rica',
      placeholder: '...',
      defaultProperties: {
        help: 'Digite aqui o texto de ajuda...',
        onlyInternal: false,
        hideLabel: false
      }
    },
  ];

  constructor(private validationService: ValidationService) {
    this.initializeDefaultStep();
  }

  getCurrentState(): FormBuilderState {
    return this.stateSubject.value;
  }

  updateState(updates: Partial<FormBuilderState>): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...updates };

    // Skip change tracking during initial load or import
    if (!currentState.lastSavedState) {
      this.stateSubject.next(newState);
      return;
    }

    // If isDirty was explicitly provided, don't recalculate it
    if ('isDirty' in updates) {
      this.stateSubject.next(newState);
      return;
    }

    // Check for changes by comparing with last saved state
    // Note: selectedComponent is UI state only, not content - don't track it for dirty flag
    if (updates.formSchema || updates.annotations) {
      const hasFormChanges = this.hasFormSchemaChanges(newState.formSchema, currentState.lastSavedState.formSchema);
      const hasAnnotationChanges = this.hasAnnotationChanges(
        newState.annotations || {},
        currentState.lastSavedState.annotations || {}
      );

      // Set isDirty when there are changes
      if (hasFormChanges || hasAnnotationChanges) {
        newState.isDirty = true;
      } else {
        // No changes detected - preserve current isDirty
        newState.isDirty = currentState.isDirty;
      }
    } else {
      // For other updates, preserve existing isDirty value
      newState.isDirty = currentState.isDirty;
    }

    this.stateSubject.next(newState);
  }

  // ========== ANOTAÇÕES (APONTAMENTOS E OBSERVAÇÕES) ==========

  getAnnotations(): { [componentId: string]: any[] } {
    const state = this.getCurrentState();
    return state.annotations || {};
  }

  getAnnotationsForComponent(componentId: string): any[] {
    const state = this.getCurrentState();
    return (state.annotations && state.annotations[componentId]) ? [...state.annotations[componentId]] : [];
  }

  setAnnotationsForComponent(componentId: string, entries: any[]): void {
    const state = this.getCurrentState();
    const annotations = { ...(state.annotations || {}) };
    annotations[componentId] = entries.map(e => ({ ...e }));
    this.updateState({ annotations });
  }

  addAnnotation(componentId: string, entry: any): void {
    const current = this.getAnnotationsForComponent(componentId);
    const now = new Date().toISOString();
    const withMeta = { ...entry, internalNote: entry.internalNote ?? false, id: entry.id || this.generateRowId(), createdAt: entry.createdAt || now, updatedAt: now, status: entry.status || 'normal' };
    current.push(withMeta);
    this.setAnnotationsForComponent(componentId, current);
  }

  updateAnnotation(componentId: string, entryId: string, updates: any): void {
    const current = this.getAnnotationsForComponent(componentId);
    const idx = current.findIndex(e => e.id === entryId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates, updatedAt: new Date().toISOString() };
      this.setAnnotationsForComponent(componentId, current);
    }
  }

  removeAnnotation(componentId: string, entryId: string): void {
    const current = this.getAnnotationsForComponent(componentId).filter(e => e.id !== entryId && e.parentId !== entryId);
    this.setAnnotationsForComponent(componentId, current);
  }

  updateAnnotationStatus(componentId: string, entryId: string, status: 'normal' | 'pendente' | 'resolvido' | 'confirmado' | 'cancelado'): void {
    this.updateAnnotation(componentId, entryId, { status });
  }

  addObservation(componentId: string, parentEntryId: string, content: string, responseType?: string): void {
    const now = new Date().toISOString();
    const entry = {
      id: this.generateRowId(),
      type: 'observacao',
      responseType: responseType || 'nao_informado',
      content,
      createdAt: now,
      updatedAt: now,
      status: 'normal',
      internalNote: false,
      parentId: parentEntryId
    } as any;
    this.addAnnotation(componentId, entry);
  }

  getComponentTemplates(): ComponentTemplate[] {
    return this.componentTemplates;
  }

  getComponentTemplatesByCategory(category: ComponentCategory): ComponentTemplate[] {
    return this.componentTemplates.filter(template => template.category === category);
  }

  createComponent(type: ComponentType, parentId?: string): FormComponent {
    const template = this.componentTemplates.find(t => t.type === type);
    const id = this.generateIdPAR();
    let key = this.generateUniqueKey(type, template);
    if (template) {
      key = this.generateUniqueKeyPAR(template.label, id);
    }

    // Deep copy properties to avoid shared references
    let defaultProperties = {};
    if (template?.defaultProperties) {
      defaultProperties = this.deepCopyProperties(template.defaultProperties);
    }
    const component: FormComponent = {
      id,
      key,
      type,
      label: '', // Start with empty label to show placeholder
      required: true,
      properties: defaultProperties,
      children: this.isContainerType(type) ? [] : undefined,
      placeholder: template?.placeholder,
      parentId
    };

    // Initialize rows for DataGrid with one sample row
    if (type === ComponentType.DATAGRID) {
      component.rows = [];
      // DataGrid starts empty - columns are added by dragging components
    }

    if (type === ComponentType.PROCESSO_SEI) {
      component.label = 'Processo SEI';
      component.properties.mask = '999999/9999';
      component.key = 'PAR_PROCESSO_SEI_PAR'
    }

    if (type === ComponentType.NUMERO_ETP) {
      component.label = 'Número do ETP';
      component.properties.mask = '999999/9999';
      component.key = 'PAR_NUMERO_ETP_PAR'
    }

    if (type === ComponentType.TIPO_CONTRATACAO) {
      component.label = 'Tipo de Contratação';
      component.key = 'PAR_TIPO_CONTRATACAO_PAR'
      component.properties.apiConfig = {
        url: this.environmenter.apiFormulario + '/etp-tipo-licitacao/lista/?limit=' + this.environmenter.formioLimitReturnAPI,
        method: 'GET',
        headers: {},
        token: '',
        labelField: 'descricao',
        valueField: 'chave',
        labelTemplate: '{descricao}',
        requestBody: '',
        cache: true,
        cacheTimeout: 30,
      };
    }

    if (type === ComponentType.UNIDADE) {

      component.label = 'Unidade';
      component.key = 'PAR_UNIDADE_PAR'
      component.properties.apiConfig = {
        url: this.environmenter.apiFormulario + '/sarhclient/listaunidades?limit=' + this.environmenter.formioLimitReturnAPI,
        method: 'GET',
        headers: {},
        token: '',
        labelField: 'descricao',
        valueField: 'sigla',
        labelTemplate: '{descricao} ({sigla})',
        requestBody: '',
        cache: true,
        cacheTimeout: 30,
      };
    }


    if (type === ComponentType.SERVIDOR) {
      component.label = 'Servidor';
      component.key = 'PAR_SERVIDOR_PAR';
      // Initialize empty options array first
      component.properties.options = [];
      //component.properties.multiple = true;
      
      component.properties.apiConfig = {
        url: this.environmenter.apiFormulario + '/sarhclient/listaservidores?limit=' + this.environmenter.formioLimitReturnAPI,
        method: 'GET',
        headers: {},
        token: '',
        labelField: "nome",
        valueField: 'matricula',
        labelTemplate: '{matricula} - {nome} - {siglaUnidade}',
        requestBody: '',
        cache: true,
        cacheTimeout: 30,
      };
    }

    return component;

  }

  addComponent(component: FormComponent, stepId?: string, parentId?: string): void {
    const state = this.getCurrentState();
    const targetStepId = stepId || state.currentStep;
    const targetStep = state.formSchema.steps.find(s => s.id === targetStepId);
    if (!targetStep) return;

    if (parentId) {
      this.addComponentToParent(targetStep.components, component, parentId);
    } else {
      targetStep.components.push(component);
    }

    this.updateState({
      formSchema: { ...state.formSchema },
      selectedComponent: component
    });
  }

  addComponentAtIndex(component: FormComponent, index: number, parentId?: string, stepId?: string): void {
    const state = this.getCurrentState();
    const targetStepId = stepId || state.currentStep;
    const targetStep = state.formSchema.steps.find(s => s.id === targetStepId);

    if (!targetStep) return;

    if (parentId) {
      this.addComponentToParentAtIndex(targetStep.components, component, parentId, index);
    } else {
      // Insert at specific index in root components
      const rootComponents = targetStep.components.filter(c => !c.parentId);
      const actualIndex = Math.min(index, rootComponents.length);

      // Find the actual position in the full components array
      let insertPosition = 0;
      let rootCount = 0;

      for (let i = 0; i < targetStep.components.length; i++) {
        if (!targetStep.components[i].parentId) {
          if (rootCount === actualIndex) {
            insertPosition = i;
            break;
          }
          rootCount++;
        }
        if (i === targetStep.components.length - 1) {
          insertPosition = targetStep.components.length;
        }
      }

      targetStep.components.splice(insertPosition, 0, component);
    }

    this.updateState({
      formSchema: { ...state.formSchema },
      selectedComponent: component
    });
  }

  removeComponent(componentId: string): void {
    const state = this.getCurrentState();
    const step = state.formSchema.steps.find(s => s.id === state.currentStep);

    if (!step) return;

    this.removeComponentFromArray(step.components, componentId);

    this.updateState({
      formSchema: { ...state.formSchema },
      selectedComponent: null
    });
  }

  updateComponent(componentId: string, updates: Partial<FormComponent>): void {
    const state = this.getCurrentState();
    const step = state.formSchema.steps.find(s => s.id === state.currentStep);

    if (!step) return;

    const component = this.findComponentInArray(componentId, step.components);
    if (component) {
      Object.assign(component, updates);

      // Atualizar validação recursiva de todos os componentes e step (apenas no preview)
      if (state.previewMode) {
        this.updateAllValidation();
      }

      this.updateState({ formSchema: { ...state.formSchema } });
    }
  }

  selectComponent(componentId: string | null | undefined): void {
    const state = this.getCurrentState();

    if (!componentId) {
      this.updateState({ selectedComponent: null, selectedStep: null });
      return;
    }

    const step = state.formSchema.steps.find(s => s.id === state.currentStep);
    if (!step) return;

    const component = this.findComponentInArray(componentId, step.components);
    this.updateState({ selectedComponent: component, selectedStep: null });
    // Ensure Properties tab becomes active when a component is selected
    if (component) {
      this.openPropertiesTab();
    }
  }

  openPropertiesTab(): void {
    this.openPropertiesTabSubject.next();
    
  }

  addStep(title: string = 'New Step'): FormStep {
    const state = this.getCurrentState();
    const newStep: FormStep = {
      id: this.generateIdPAR(),
      title,
      components: [],
      order: state.formSchema.steps.length
    };

    state.formSchema.steps.push(newStep);
    this.updateState({
      formSchema: { ...state.formSchema },
      currentStep: newStep.id
    });

    return newStep;
  }

  removeStep(stepId: string): void {
    const state = this.getCurrentState();
    const stepIndex = state.formSchema.steps.findIndex(s => s.id === stepId);

    if (stepIndex === -1) return;

    state.formSchema.steps.splice(stepIndex, 1);

    // Update order for remaining steps
    state.formSchema.steps.forEach((step, index) => {
      step.order = index;
    });

    // Select first step if current step was removed
    const newCurrentStep = state.formSchema.steps.length > 0
      ? state.formSchema.steps[0].id
      : '';

    this.updateState({
      formSchema: { ...state.formSchema },
      currentStep: newCurrentStep,
      selectedComponent: null,
      selectedStep: null
    });
  }

  moveStep(stepId: string, direction: 'left' | 'right'): void {
    const state = this.getCurrentState();
    const stepIndex = state.formSchema.steps.findIndex(s => s.id === stepId);

    if (stepIndex === -1) return;

    const newIndex = direction === 'left' ? stepIndex - 1 : stepIndex + 1;

    if (newIndex < 0 || newIndex >= state.formSchema.steps.length) return;

    // Swap steps
    [state.formSchema.steps[stepIndex], state.formSchema.steps[newIndex]] =
      [state.formSchema.steps[newIndex], state.formSchema.steps[stepIndex]];

    // Update order
    state.formSchema.steps.forEach((step, index) => {
      step.order = index;
    });

    this.updateState({ formSchema: { ...state.formSchema } });
  }

  setCurrentStep(stepId: string): void {
    this.updateState({ currentStep: stepId, selectedComponent: null, selectedStep: null });
  }

  selectStep(stepId: string): void {
    const state = this.getCurrentState();
    const step = state.formSchema.steps.find(s => s.id === stepId);

    if (step) {
      this.updateState({
        selectedStep: step,
        selectedComponent: null,
        currentStep: stepId
      });
      this.openPropertiesTab();
    }
  }

  updateStep(stepId: string, updates: Partial<FormStep>): void {
    const state = this.getCurrentState();
    const step = state.formSchema.steps.find(s => s.id === stepId);

    if (step) {
      Object.assign(step, updates);

      // Update selectedStep if it's the same step being updated
      if (state.selectedStep && state.selectedStep.id === stepId) {
        this.updateState({
          formSchema: { ...state.formSchema },
          selectedStep: { ...step }
        });
      } else {
        this.updateState({ formSchema: { ...state.formSchema } });
      }
    }
  }

  buildTreeNodes(components: FormComponent[]): TreeNode[] {
    return components.map(component => ({
      id: component.id,
      label: component.label,
      type: component.type,
      children: component.children ? this.buildTreeNodes(component.children) : undefined,
      expanded: true,
      selected: false,
      parentId: component.parentId
    }));
  }

  /**
   * Exporta apenas a estrutura do formulário, sem dados de usuário
   * Remove: value, rows, selected, valid, etc.
   */
  exportFormSchema(): string {
    const state = this.getCurrentState();
    const cleanSchema = this.cleanSchemaForExport(state.formSchema);
    return JSON.stringify(cleanSchema, null, 2);
  }

  /**
   * Remove todos os dados de usuário do schema, mantendo apenas a estrutura
   */
  private cleanSchemaForExport(schema: FormSchema): FormSchema {
    const cleanedSchema: FormSchema = {
      ...schema,
      steps: schema.steps.map(step => ({
        ...step,
        components: this.cleanComponentsForExport(step.components),
        valid: undefined // Remove validation state
      }))
    };
    return cleanedSchema;
  }

  /**
   * Limpa componentes recursivamente, removendo valores e dados de runtime
   */
  private cleanComponentsForExport(components: FormComponent[]): FormComponent[] {
    return components.map(component => {
      const cleaned: FormComponent = {
        ...component,
        value: undefined, // Remove dados de usuário
        rows: undefined, // Remove dados de DataGrid
        valid: undefined, // Remove estado de validação runtime
        properties: {
          ...component.properties,
          delegation: component.properties.delegation ? {
            isDelegated: false, // Reset delegation state
            delegatedTo: undefined
          } : undefined
        }
      };

      // Limpar opções selecionadas
      if (cleaned.properties.options && Array.isArray(cleaned.properties.options)) {
        cleaned.properties.options = cleaned.properties.options.map(opt => ({
          ...opt,
          selected: undefined // Remove selected flag
        }));
      }

      // Processar componentes filhos recursivamente
      if (component.children && component.children.length > 0) {
        cleaned.children = this.cleanComponentsForExport(component.children);
      }

      return cleaned;
    });
  }

  importFormSchema(schemaJson: string): void {
    try {
      const schema: FormSchema = JSON.parse(schemaJson);

      // Normalizar e sincronizar valores com opções selecionadas
      this.normalizeImportedSchema(schema);

      // Preserve current step if it still exists in the new schema
      const prev = this.getCurrentState();
      const keepStep = prev.currentStep && schema.steps.some(s => s.id === prev.currentStep);
      const nextCurrent = keepStep ? prev.currentStep : (schema.steps.length > 0 ? schema.steps[0].id : '');

      this.updateState({
        formSchema: schema,
        currentStep: nextCurrent,
        selectedComponent: null,
        selectedStep: null
      });

      // Initialize lastSavedState to mark imported schema as saved
      this.resetUnsavedChangesFlag();

      // Atualizar validação após importação
      this.updateAllStepsValidation();
      this.triggerConditionalLogicUpdate();
    } catch (error) {
      console.error('Error importing form schema:', error);
    }
  }

  // Importa um JSON no padrão Form.io e converte para o schema desta aplicação,
  // adicionando novos steps ao final sem remover os existentes
  importFormioSchema(formioJson: string): void {
    let payload: any;
    try {
      payload = JSON.parse(formioJson);
    } catch (e) {
      console.error('Invalid Form.io JSON:', e);
      throw new Error('JSON do Form.io inválido');
    }

    if (!payload || !Array.isArray(payload.components)) {
      throw new Error('JSON do Form.io inválido: campo components ausente');
    }

    const state = this.getCurrentState();
    const previousCurrentStep = state.currentStep;
    const usedIds = new Set<string>(this.getAllComponentKeys());

    // Estratégia: se os componentes de topo forem painéis, cada painel vira um step
    const topComponents: any[] = payload.components || [];
    const panelsAsSteps = topComponents.filter(c => String(c.type).toLowerCase() === 'panel');

    let newSteps: FormStep[] = [];

    if (panelsAsSteps.length > 0) {
      panelsAsSteps.forEach((panel, idx) => {
        const panelChildren: any[] = Array.isArray(panel.components) ? panel.components : [];
        const firstChild = panelChildren[0];
        const firstIsPanel = firstChild && String(firstChild.type).toLowerCase() === 'panel';

        // Título do step: usar SEMPRE o título do painel de topo
        const stepTitle = panel.title
          || panel.label
          || `Etapa ${state.formSchema.steps.length + newSteps.length + 1}`;

        const stepProps: any = {};
        if (firstIsPanel) {
          if (firstChild.hidden) stepProps.invisible = true;
          if (firstChild.disabled) stepProps.disabled = true;
          if (firstChild.conditional && (firstChild.conditional.when || firstChild.conditional.show !== undefined)) {
            stepProps.conditional = {
              show: String(!!firstChild.conditional.show),
              when: firstChild.conditional.when || '',
              eq: firstChild.conditional.eq != null ? String(firstChild.conditional.eq) : ''
            };
          }
        }

        // Step ID: prefer the top-level panel key to keep stable IDs from Form.io
        const existingStepIds = new Set<string>([
          ...state.formSchema.steps.map(s => s.id),
          ...newSteps.map(s => s.id)
        ]);
        let desiredStepId = this.sanitizeId(String(panel.key || '')) || this.generateIdPAR();
        let finalStepId = desiredStepId;
        let stepCounter = 1;
        while (existingStepIds.has(finalStepId)) {
          finalStepId = `${desiredStepId}_${stepCounter++}`;
        }
        existingStepIds.add(finalStepId);

        const step: FormStep = {
          id: finalStepId,
          title: stepTitle,
          components: [],
          order: state.formSchema.steps.length + newSteps.length,
          properties: Object.keys(stepProps).length ? stepProps : undefined
        };

        // Componentes do step: incluir todos os componentes filhos (inclusive o primeiro painel interno)
        const contentComponents = panelChildren;
        contentComponents.forEach(child => {
          const converted = this.convertFormioComponent(child, undefined, undefined, usedIds);
          if (converted) step.components.push(converted);
        });

        newSteps.push(step);
      });
    } else {
      // Fallback: um único step com todos os componentes
      const stepTitle = payload.title || 'Importado';
      const step: FormStep = {
        id: this.generateIdPAR(),
        title: stepTitle,
        components: [],
        order: state.formSchema.steps.length
      };
      (payload.components || []).forEach((c: any) => {
        const converted = this.convertFormioComponent(c, undefined, undefined, usedIds);
        if (converted) step.components.push(converted);
      });
      newSteps = [step];
    }

    // Substituir passos existentes pelos importados (remover step padrão anterior)
    const updatedSteps = newSteps.map((s, idx) => ({ ...s, order: idx }));

    // Preserve current step if it still exists after import
    const prev = this.getCurrentState();
    const keepStep = prev.currentStep && updatedSteps.some(s => s.id === prev.currentStep);
    const newCurrentStep = keepStep ? prev.currentStep : (updatedSteps.length > 0 ? updatedSteps[0].id : '');

    this.updateState({
      formSchema: { ...state.formSchema, steps: updatedSteps },
      currentStep: newCurrentStep,
      selectedComponent: null,
      selectedStep: null
    });

    // Initialize lastSavedState to mark imported schema as saved
    this.resetUnsavedChangesFlag();

    this.updateAllStepsValidation();
    this.triggerConditionalLogicUpdate();
  }

  // Converte um componente do Form.io para o modelo desta aplicação
  private convertFormioComponent(src: any, parentId?: string, columnIndex?: number, usedIds?: Set<string>): FormComponent | null {
    if (!src || typeof src !== 'object') return null;

    // Trata alguns wrappers: Panel, Columns, DataGrid, Conteúdo/HTML
    const typeMap: { [k: string]: ComponentType } = {
      textfield: ComponentType.INPUT,
      textarea: ComponentType.RICH_TEXT,
      richtext: ComponentType.RICH_TEXT,
      wysiwyg: ComponentType.RICH_TEXT,
      number: ComponentType.NUMBER,
      email: ComponentType.EMAIL,
      password: ComponentType.PASSWORD,
      url: ComponentType.URL,
      phoneNumber: ComponentType.TEL,
      tel: ComponentType.TEL,
      select: ComponentType.SELECT,
      selectboxes: ComponentType.SELECT_BOX,
      checkbox: ComponentType.CHECKBOX,
      radio: ComponentType.RADIO,
      datetime: ComponentType.DATE,
      day: ComponentType.DATE,
      date: ComponentType.DATE,
      file: ComponentType.FILE,
      panel: ComponentType.PANEL,
      columns: ComponentType.COLUMNS,
      datagrid: ComponentType.DATAGRID,
      content: ComponentType.TEXT_HELP,
      htmlelement: ComponentType.TEXT_HELP,
      notainterna: ComponentType.TEXT_HELP,
      botaoajuda: ComponentType.TEXT_HELP,
      tipocontratacaoselect: ComponentType.TIPO_CONTRATACAO,
      unidadeselect: ComponentType.UNIDADE,
      servidorselect: ComponentType.SERVIDOR,
      processoseitextfield: ComponentType.PROCESSO_SEI,
      numeroetptextfield: ComponentType.NUMERO_ETP

    };

    const formioType = String(src.type || '').toLowerCase();
    const mappedType = typeMap[formioType] || ComponentType.INPUT;

    // ID deve vir do 'key' do Form.io quando existir
    const registry = usedIds || new Set<string>();
    let desiredId = this.sanitizeId(String(src.key || ''));
    if (!desiredId) desiredId = this.generateIdPAR();

    let finalId = desiredId;

    // If ID already exists, append a random number before the last segment
    if (registry.has(finalId)) {
      const randomNumber = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

      // Check if the ID ends with _PAR or similar suffix pattern
      const lastUnderscoreIndex = desiredId.lastIndexOf('_');
      if (lastUnderscoreIndex > 0 && lastUnderscoreIndex < desiredId.length - 1) {
        // Insert random number before the last segment
        // Example: PAR_DIGITE_ROTULO_PAR -> PAR_DIGITE_ROTULO_000001_PAR
        const prefix = desiredId.substring(0, lastUnderscoreIndex);
        const suffix = desiredId.substring(lastUnderscoreIndex);
        finalId = `${prefix}_${randomNumber}${suffix}`;
      } else {
        // If no clear suffix, just append the random number
        finalId = `${desiredId}_${randomNumber}`;
      }

      // Ensure the new ID is also unique
      while (registry.has(finalId)) {
        const newRandomNumber = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        const prefix = desiredId.substring(0, lastUnderscoreIndex > 0 ? lastUnderscoreIndex : desiredId.length);
        const suffix = lastUnderscoreIndex > 0 ? desiredId.substring(lastUnderscoreIndex) : '';
        finalId = `${prefix}_${newRandomNumber}${suffix}`;
      }
    }

    registry.add(finalId);

    // Para painéis, o "label" deve vir do campo "title" do Form.io
    const computedLabel = (mappedType === ComponentType.PANEL)
      ? (src.title || src.label || 'Seção')
      : (src.label || src.title || formioType || 'Campo');

    // A chave segue o key do Form.io quando existir; caso contrário, gerar
    const key = src.key ? String(src.key) : this.generateUniqueKeyPAR(computedLabel, finalId);

    const base: FormComponent = {
      id: finalId,
      key,
      type: mappedType,
      label: computedLabel,
      required: !!(src.validate && src.validate.required),
      properties: {},
      parentId,
      columnIndex
    } as FormComponent;

    // Propriedades comuns
    base.properties.placeholder = src.placeholder || src.description || '';
    if (src.tooltip) base.properties.tooltip = src.tooltip;
    if (src.disabled) base.properties.disabled = !!src.disabled;
    if (src.hidden) base.properties.hidden = !!src.hidden;
    if (src.hideLabel) base.properties.hideLabel = !!src.hideLabel;

    // Validações básicas
    const validations: any[] = [];
    if (src.validate) {
      if (src.validate.minLength) validations.push({ type: 'minLength', value: src.validate.minLength, message: '' });
      if (src.validate.maxLength) validations.push({ type: 'maxLength', value: src.validate.maxLength, message: '' });
      if (src.validate.pattern) validations.push({ type: 'pattern', value: src.validate.pattern, message: '' });
      if (src.validate.min) validations.push({ type: 'min', value: src.validate.min, message: '' });
      if (src.validate.max) validations.push({ type: 'max', value: src.validate.max, message: '' });
    }
    if (validations.length) base.validation = validations;

    // Lógica condicional - Suporta dois formatos Form.io:
    // 1. Formato simples: component.conditional { when, eq, show }
    // 2. Formato logic: component.logic[].trigger.simple { when, eq, show }
    // IMPORTANTE: O "when" do Form.io é a KEY, precisa converter para ID para ser compatível com o properties-panel

    let conditionalData: any = null;
    let whenKey: string | null = null;
    let eqValue: string | null = null;
    let showValue: string = 'true';

    // Tentar primeiro o formato simples (conditional)
    if (src.conditional && (src.conditional.when || src.conditional.show !== undefined)) {
      whenKey = src.conditional.when || null;
      eqValue = src.conditional.eq != null ? String(src.conditional.eq) : null;
      showValue = String(!!src.conditional.show) as 'true' | 'false';
      console.log(`[Import] Conditional simples encontrado para ${src.key}: when=${whenKey}, eq=${eqValue}`);
    }
    // Se não encontrar conditional, tentar logic array
    else if (Array.isArray(src.logic) && src.logic.length > 0) {
      const firstLogic = src.logic[0];
      if (firstLogic.trigger && firstLogic.trigger.type === 'simple' && firstLogic.trigger.simple) {
        const simple = firstLogic.trigger.simple;
        whenKey = simple.when || null;
        eqValue = simple.eq != null ? String(simple.eq) : null;
        showValue = String(!!simple.show) as 'true' | 'false';
        console.log(`[Import] Logic simples encontrado para ${src.key}: when=${whenKey}, eq=${eqValue}`);
      }
    }

    // Se encontrou um conditional, precisa converter o whenKey (que é a KEY do componente) para ID
    if (whenKey) {
      // NOTA: Neste ponto do import, nem todos os componentes podem ter sido criados ainda
      // Portanto, salvamos temporariamente a KEY, e será convertida para ID durante normalizeImportedSchema
      conditionalData = {
        show: showValue as 'true' | 'false',
        when: whenKey,  // Salva a KEY temporariamente
        eq: eqValue || ''
      };
      base.properties.conditional = conditionalData as any;
    }
       // Máscara
    if (src.inputMask || src.displayMask) {
        base.properties.mask = src.inputMask || src.displayMask;
    }

    // Mapeamentos específicos por tipo
    switch (mappedType) {
      case ComponentType.TEXT_HELP: {
        base.properties.help = src.html || src.content || src.value || '';
        base.properties.onlyInternal = String(formioType) === 'notainterna';
        base.required = false;
        break;
      }
      case ComponentType.RICH_TEXT: {
        // Map Form.io TextArea to CKEditor-based rich text
        // base.properties.ckEditorConfig = {
        //   toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo'],
        //   height: src.rows ? Math.max(120, Math.min(800, src.rows * 40)) : 200,
        //   language: 'pt-br'
        // };
        base.placeholder = src.placeholder || '';
        break;
      }
      case ComponentType.PROCESSO_SEI:
      case ComponentType.NUMERO_ETP: {
        base.properties.mask = '999999/9999';
        break;
      }
      case ComponentType.SELECT: {
        // Fonte de dados
        const dataSrc = src.dataSrc || (src.data && src.data.resource ? 'resource' : (src.data && src.data.values ? 'values' : ''));
        base.properties.options = [];
        if (dataSrc === 'values' && Array.isArray(src.data?.values)) {
          base.properties.options = src.data.values.map((v: any) => ({ value: v.value, label: v.label }));
        } else if (dataSrc === 'url' && src.data?.url) {
          // Converte para SELECT_API
          base.type = ComponentType.SELECT_API;
          base.properties.apiConfig = {
            url: src.data.url,
            method: 'GET',
            headers: this.extractHeaders(src.data?.headers),
            labelField: src.labelProperty || 'label',
            valueField: src.valueProperty || 'value',
            cache: true,
            cacheTimeout: 30,
          };
        }
        break;
      }
      case ComponentType.TIPO_CONTRATACAO: {
        base.type = ComponentType.TIPO_CONTRATACAO;
        base.properties.apiConfig = {
          url: this.environmenter.apiFormulario + '/etp-tipo-licitacao/lista?limit=' + this.environmenter.formioLimitReturnAPI,
          method: 'GET',
          headers: {},
          token: '',
          labelField: 'descricao',
          valueField: 'chave',
          labelTemplate: '{descricao}',
          requestBody: '',
          cache: true,
          cacheTimeout: 30,
        };
        break;
      }
      case ComponentType.SELECT_API:
      case ComponentType.UNIDADE:
      case ComponentType.SERVIDOR:
        {
          base.properties.multiple = !!src.multiple;
          base.properties.options = [];

          // Configure based on component type
          let url = '';
          let labelField = '';
          let valueField = '';
          let labelTemplate = '';

          if (base.type === ComponentType.SERVIDOR) {
            url = this.environmenter.apiFormulario + '/sarhclient/listaservidores?limit=' + this.environmenter.formioLimitReturnAPI;
            labelField = 'nome';
            valueField = 'matricula';
            labelTemplate = '{matricula} - {nome} - {siglaUnidade}';
          } else if (base.type === ComponentType.UNIDADE) {
            url = this.environmenter.apiFormulario + '/sarhclient/listaunidades?limit=' + this.environmenter.formioLimitReturnAPI;
            labelField = 'descricao';
            valueField = 'sigla';
            labelTemplate = '{sigla} - {descricao}';
          } else if (base.type === ComponentType.TIPO_CONTRATACAO) {
            labelTemplate = '{descricao}';
          }

          base.properties.apiConfig = {
            url: url || '',
            method: 'GET',
            headers: {},
            labelField: labelField,
            valueField: valueField,
            labelTemplate: labelTemplate || undefined,
            cache: true,
            cacheTimeout: 30
          };
          break;
        }
      case ComponentType.SELECT_BOX: {
        base.properties.multiple = true;
        base.properties.options = Array.isArray(src.values)
          ? src.values.map((v: any) => ({ value: v.value, label: v.label }))
          : Array.isArray(src.data?.values)
            ? src.data.values.map((v: any) => ({ value: v.value, label: v.label }))
            : [];
        break;
      }
      case ComponentType.RADIO: {
        base.properties.options = Array.isArray(src.values)
          ? src.values.map((v: any) => ({ value: v.value, label: v.label }))
          : Array.isArray(src.data?.values)
            ? src.data.values.map((v: any) => ({ value: v.value, label: v.label }))
            : [];
        break;
      }
      case ComponentType.CHECKBOX: {
        // Single checkbox
        break;
      }
      case ComponentType.FILE: {
        base.properties.accept = src.storage ? '*/*' : (src.accept || '*/*');
        break;
      }
      case ComponentType.NUMBER: {
        if (src.validate?.min != null) base.properties.min = src.validate.min;
        if (src.validate?.max != null) base.properties.max = src.validate.max;
        if (src.validate?.step != null) base.properties.step = src.validate.step;
        break;
      }
      case ComponentType.TEXTAREA: {
        if (src.rows) base.properties.rows = src.rows;
        break;
      }
      case ComponentType.DATE: {
        break;
      }
      case ComponentType.COLUMNS: {
        const columns = Array.isArray(src.columns) ? src.columns : [];
        base.properties.columns = columns.map((col: any) => ({
          width: typeof col.width === 'number' ? col.width : (col.size === 'md' ? 6 : 6),
          offset: col.offset || 0,
          push: col.push || 0,
          pull: col.pull || 0,
          size: col.size || 'md',
          currentWidth: col.width || undefined
        }));
        // Default: ocultar rótulo para Columns importados do Form.io
        base.properties.hideLabel = true;
        base.children = [];
        columns.forEach((col: any, idx: number) => {
          (col.components || []).forEach((child: any) => {
            const convertedChild = this.convertFormioComponent(child, base.id, idx, usedIds);
            if (convertedChild) base.children!.push(convertedChild);
          });
        });
        break;
      }
      case ComponentType.PANEL: {
        base.properties.collapsible = !!src.collapsible || !!src.collapsible || !!src.collapsible;
        base.properties.initCollapsed = !!src.collapsed;
        base.children = [];
        (src.components || []).forEach((child: any) => {
          const convertedChild = this.convertFormioComponent(child, base.id, undefined, usedIds);
          if (convertedChild) base.children!.push(convertedChild);
        });
        break;
      }
      case ComponentType.DATAGRID: {
        // Converte os componentes internos como "template" (children)
        base.children = [];
        (src.components || []).forEach((child: any) => {
          const convertedChild = this.convertFormioComponent(child, base.id, undefined, usedIds);
          if (convertedChild) base.children!.push(convertedChild);
        });
        // Propriedades padrão de DataGrid
        base.properties.tableView = true;
        base.properties.rowDrafts = false;
        base.properties.addAnother = src.addAnother || 'Adiciona';
        base.properties.addAnotherPosition = src.addAnotherPosition || 'bottom';
        base.properties.reorder = src.reorder !== false;
        base.properties.defaultOpen = src.defaultOpen !== false;
        base.properties.disableAddingRemovingRows = !!src.disableAddingRemovingRows;
        base.rows = [];
        break;
      }
      default:
        break;
    }

 

    return base;
  }

  private sanitizeId(raw: string): string {
    const cleaned = raw.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '_');
    return cleaned;
  }

  private extractHeaders(headers: any): { [k: string]: string } | undefined {
    if (!headers) return undefined;
    if (Array.isArray(headers)) {
      const h: { [k: string]: string } = {};
      headers.forEach((item: any) => {
        if (item && item.key) h[item.key] = item.value;
      });
      return Object.keys(h).length ? h : undefined;
    }
    if (typeof headers === 'object') return { ...headers } as any;
    return undefined;
  }


  // Método para normalizar o schema importado
  private normalizeImportedSchema(schema: FormSchema): void {
    schema.steps.forEach(step => {
      this.normalizeComponents(step.components);
    });
  }

  // Método recursivo para normalizar componentes
  private normalizeComponents(components: FormComponent[]): void {
    components.forEach(component => {
      // Sincronizar valores com opções selecionadas para select e radio
      this.syncComponentValueWithOptions(component);

      // Converter KEYs para IDs nos condicionais (importante para import do Form.io)
      this.normalizeConditionalLogic(component);

      // Processar componentes filhos recursivamente
      if (component.children) {
        this.normalizeComponents(component.children);
      }
    });
  }

  // Converte as KEYs para IDs nos condicionais após o import
  // Isso é necessário porque o Form.io armazena "when" como KEY, mas o properties-panel espera ID
  private normalizeConditionalLogic(component: FormComponent): void {
    if (!component.properties?.conditional) {
      return;
    }

    const conditional = component.properties.conditional;

    // Se "when" estiver preenchido e parecer ser uma KEY (não um ID como comp_123)
    if (conditional.when && typeof conditional.when === 'string') {
      // Tentar encontrar o componente pela KEY
      const whenComponent = this.getComponentByKey(conditional.when);

      if (whenComponent) {
        // Encontrou o componente pela KEY, converter para ID
        conditional.when = whenComponent.id;
        console.log(`[Normalize] Convertendo when: ${whenComponent.key} -> ${whenComponent.id}`);
      } else {
        // Se não encontrar pela KEY, assume que já é um ID
        console.log(`[Normalize] Não encontrou componente com key '${conditional.when}', mantendo como está`);
      }
    }
  }

  // Método para sincronizar valor do componente com opções selecionadas
  private syncComponentValueWithOptions(component: FormComponent): void {
    if (component.type === ComponentType.SELECT ||
      component.type === ComponentType.RADIO ||
      component.type === ComponentType.SELECT_BOX ||
      component.type === ComponentType.SELECT_API ||
      component.type === ComponentType.TIPO_CONTRATACAO ||
      component.type === ComponentType.UNIDADE ||
      component.type === ComponentType.SERVIDOR) {

      if (component.properties.options && component.value !== undefined && component.value !== null) {
        // Para select e radio com valor ��nico
        if (component.type === ComponentType.SELECT || component.type === ComponentType.RADIO) {
          component.properties.options.forEach(option => {
            option.selected = option.value == component.value;
          });
        }
        // Para select box com múltipla seleção
        else if (component.type === ComponentType.SELECT_BOX && component.properties.multiple) {
          let selectedValues: any[];
          // Form.io selectboxes export as an object: { key1: true, key2: false }
          if (component.value && typeof component.value === 'object' && !Array.isArray(component.value)) {
            selectedValues = Object.keys(component.value).filter(k => component.value[k] === true || component.value[k] === 'true');
            // Normalize internal value to array of selected keys for consistency
            component.value = selectedValues;
          } else {
            selectedValues = Array.isArray(component.value) ? component.value : [component.value];
          }
          component.properties.options.forEach(option => {
            option.selected = selectedValues.some(val => val == option.value || val == option.label);
          });
        }
        // Para select box com seleção única
        else if (component.type === ComponentType.SELECT_BOX && !component.properties.multiple) {
          component.properties.options.forEach(option => {
            option.selected = option.value == component.value;
          });
        }
        // Para SELECT_API components (inclui TIPO_CONTRATACAO, UNIDADE, SERVIDOR)
        else if (component.type === ComponentType.SELECT_API || component.type === ComponentType.TIPO_CONTRATACAO || component.type === ComponentType.UNIDADE || component.type === ComponentType.SERVIDOR) {

          // Certifica que temos um template apropriado
          if (!component.properties.apiConfig?.labelTemplate) {
            if (component.type === ComponentType.SERVIDOR) {
              component.properties.apiConfig = {
                ...component.properties.apiConfig,
                labelTemplate: '{nome} ({matricula})'
              };
            } else if (component.type === ComponentType.UNIDADE) {
              component.properties.apiConfig = {
                ...component.properties.apiConfig,
                labelTemplate: '{descricao} ({sigla})'
              };
            } else if (component.type === ComponentType.TIPO_CONTRATACAO) {
              component.properties.apiConfig = {
                ...component.properties.apiConfig,
                labelTemplate: '{descricao}'
              };
            }
          }

          // Processa as opções para usar o labelTemplate se existir
          if (component.properties.options && Array.isArray(component.properties.options)) {
            const template = component.properties.apiConfig?.labelTemplate;

            if (template) {
              component.properties.options = component.properties.options.map(opt => {
                let label = template;
                Object.keys(opt).forEach(key => {
                  label = label.replace(new RegExp(`{${key}}`, 'g'), opt[key as keyof typeof opt]);
                });
                return { ...opt, label };
              });
            }
          }
          if (component.properties.multiple) {
            const selectedValues = Array.isArray(component.value) ? component.value : [component.value];
            component.properties.options.forEach(option => {
              option.selected = selectedValues.some(val => this.compareSelectApiValues(val, option, component));
            });
          } else {
            component.properties.options.forEach(option => {
              option.selected = this.compareSelectApiValues(component.value, option, component);
            });
          }
        }
      }
    }
  }

  private createEmptySchema(): FormSchema {
    return {
      id: this.generateIdPAR(),
      name: 'Novo Formulário',
      steps: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    };
  }

  private initializeDefaultStep(): void {
    const defaultStep = this.addStep('Página 1');
    this.setCurrentStep(defaultStep.id);
  }

  private isContainerType(type: ComponentType): boolean {
    return [ComponentType.PANEL, ComponentType.ACCORDION, ComponentType.COLUMNS, ComponentType.DATAGRID].includes(type);
  }

  private addComponentToParent(components: FormComponent[], component: FormComponent, parentId: string): void {
    for (const comp of components) {
      if (comp.id === parentId && comp.children) {
        comp.children.push(component);
        component.parentId = parentId;
        return;
      }
      if (comp.children) {
        this.addComponentToParent(comp.children, component, parentId);
      }
    }
  }

  private addComponentToParentAtIndex(components: FormComponent[], component: FormComponent, parentId: string, index: number): void {
    for (const comp of components) {
      if (comp.id === parentId && comp.children) {
        const actualIndex = Math.min(index, comp.children.length);
        comp.children.splice(actualIndex, 0, component);
        component.parentId = parentId;
        return;
      }
      if (comp.children) {
        this.addComponentToParentAtIndex(comp.children, component, parentId, index);
      }
    }
  }

  private removeComponentFromArray(components: FormComponent[], componentId: string): boolean {
    for (let i = 0; i < components.length; i++) {
      if (components[i].id === componentId) {
        components.splice(i, 1);
        return true;
      }
      if (components[i].children && this.removeComponentFromArray(components[i].children!, componentId)) {
        return true;
      }
    }
    return false;
  }


  private generateId(): string {
    const maxId = this.getMaxExistingId();
    return `comp_${maxId + 1}`;
  }

  private generateIdPAR(): string {
    const maxId = this.getMaxExistingId();
    return `comp_${maxId + 1}`;
  }

  private getMaxExistingId(): number {
    // Handle case during service construction when state is not yet initialized
    if (!this.stateSubject || !this.stateSubject.value) {
      return 0;
    }

    const state = this.getCurrentState();
    let maxId = 0;

    // Check form schema ID
    if (state.formSchema.id) {
      const schemaIdNum = this.extractNumericId(state.formSchema.id);
      if (schemaIdNum > maxId) {
        maxId = schemaIdNum;
      }
    }

    // Check all steps
    state.formSchema.steps.forEach(step => {
      // Check step ID
      const stepIdNum = this.extractNumericId(step.id);
      if (stepIdNum > maxId) {
        maxId = stepIdNum;
      }

      // Check all components in this step
      maxId = Math.max(maxId, this.getMaxIdFromComponents(step.components));
    });

    // Also check annotations entries to avoid duplicate row ids
    const annotations = state.annotations || {};
    Object.keys(annotations).forEach(cid => {
      (annotations[cid] || []).forEach((entry: any) => {
        const annIdNum = this.extractNumericId(String(entry?.id || ''));
        if (annIdNum > maxId) maxId = annIdNum;
      });
    });

    return maxId;
  }

  private getMaxIdFromComponents(components: FormComponent[]): number {
    let maxId = 0;

    components.forEach(component => {
      // Check component ID
      const componentIdNum = this.extractNumericId(component.id);
      if (componentIdNum > maxId) {
        maxId = componentIdNum;
      }

      // Recursively check children components
      if (component.children && component.children.length > 0) {
        const childMaxId = this.getMaxIdFromComponents(component.children);
        if (childMaxId > maxId) {
          maxId = childMaxId;
        }
      }

      // Check DataGrid rows if they exist
      if (component.rows && component.rows.length > 0) {
        component.rows.forEach(row => {
          const rowIdNum = this.extractNumericId(row.id);
          if (rowIdNum > maxId) {
            maxId = rowIdNum;
          }
        });
      }
    });

    return maxId;
  }

  private extractNumericId(id: string): number {
    if (!id) return 0;

    // Try to extract number from patterns like "comp_123", "step_456", "row_789", etc.
    const match = id.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private generateUniqueKey(type: ComponentType, template: any): string {
    // Generate a unique key based on component type
    const typePrefix = type.toLowerCase().replace(/[^a-z]/g, '');
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `${typePrefix}_${timestamp}_${random}`;
  }

  public generateUniqueKeyPAR(label: string, key: string = ""): string {
    // Generate a unique key based on component type
    const id = this.getMaxExistingId();
    return this.functionAux.createKeyApi(label, id);
  }

  public generateUniqueKeyVALUE_PAR(label: string): string {
    // Generate a unique key based on component type
    return this.functionAux.createKeyApiValue(label);

  }

  // Method to get all component keys for conditional logic
  getAllComponentKeys(): string[] {
    const state = this.getCurrentState();
    const keys: string[] = [];

    const extractKeys = (components: FormComponent[]) => {
      components.forEach(component => {
        if (component.key) {
          keys.push(component.key);
        }
        if (component.children) {
          extractKeys(component.children);
        }
      });
    };

    state.formSchema.steps.forEach(step => {
      extractKeys(step.components);
    });

    return keys;
  }


  // Método para obter todos os pares key/value dos componentes
  getAllComponentKeyValues(): { id: string, key: string, name: string, type: string}[] {
    const state = this.getCurrentState();
    const keyValues: { id: string, key: string, name: string, type: string }[] = [];

    const extractKeyValues = (components: FormComponent[]) => {
      components.forEach(component => {
        if (component.key) {
          keyValues.push({
            id: component.id,
            key: component.key,
            name: component.label || String(component.type) || '',
            type: String(component.type)
          });
        }
        if (component.children) {
          extractKeyValues(component.children);
        }
      });
    };

    state.formSchema.steps.forEach(step => {
      extractKeyValues(step.components);
    });

    return keyValues;
  }

  // Method to get component by key
  getComponentByKey(key: string): FormComponent | null {
    const state = this.getCurrentState();

    const findByKey = (components: FormComponent[]): FormComponent | null => {
      for (const component of components) {
        if (component.key === key) {
          return component;
        }
        if (component.children) {
          const found = findByKey(component.children);
          if (found) return found;
        }
      }
      return null;
    };

    for (const step of state.formSchema.steps) {
      const found = findByKey(step.components);
      if (found) return found;
    }

    return null;
  }

  // Method to get component by id
  getComponentById(id: string): FormComponent | null {
    const state = this.getCurrentState();
    return this.findComponentByIdInSteps(id, state.formSchema.steps);
  }

  // Method to get component value for conditional logic evaluation
  getComponentValueById(id: string): any {
    const component = this.getComponentById(id);
    if (!component) {
      return null;
    }

    // Handle different component types - same logic as form-component-renderer
    switch (component.type) {
      case ComponentType.CHECKBOX:
        if (component.properties.options && component.properties.options.length > 0) {
          // Checkbox group - return selected values
          return component.properties.options
            .filter(opt => opt.selected)
            .map(opt => opt.value)
            .join(',');
        } else {
          // Single checkbox
          return component.value ? 'true' : 'false';
        }
      case ComponentType.SELECT_BOX:
        if (component.properties.multiple) {
          // Multiple selection - return array as comma-separated string
          const values = Array.isArray(component.value) ? component.value : [];
          return values.join(',');
        } else {
          // Single selection
          return component.value || '';
        }
      case ComponentType.RADIO:
      case ComponentType.SELECT:
        return component.value || '';
      case ComponentType.SELECT_API:
      case ComponentType.TIPO_CONTRATACAO:
      case ComponentType.UNIDADE:
      case ComponentType.SERVIDOR:

        {
          const val = component.value;
          const valueField = component.properties.apiConfig?.valueField || 'id';
          if (component.properties.multiple) {
            const arr = Array.isArray(val) ? val : (val != null ? [val] : []);
            const normalized = arr.map(v => {
              if (typeof v === 'object' && v !== null) {
                return v[valueField] || v.value || v.id || v;
              }
              return v;
            });
            return normalized.join(',');
          } else {
            if (typeof val === 'object' && val !== null) {
              return val[valueField] || val.value || val.id || '';
            }
            return val || '';
          }
        }
      default:
        return component.value || '';
    }
  }

  // Method to trigger conditional logic update across all components
  triggerConditionalLogicUpdate(): void {
    const currentState = this.getCurrentState();

    // Only update conditional logic and validation while in preview mode
    if (!currentState.previewMode) {
      // Still trigger state update for conditional logic in builder mode
      this.updateState({ ...currentState });
      return;
    }

    // Also update all validation when values change (preview mode only)
    this.updateAllValidation();

    this.updateState({ ...currentState });
  }

  addComponentToParentChildren(parentId: string, component: FormComponent): void {
    const state = this.getCurrentState();
    const parentComponent = this.findComponentByIdInSteps(parentId, state.formSchema.steps);

    if (parentComponent && parentComponent.children) {
      parentComponent.children.push(component);
      this.updateState({ formSchema: { ...state.formSchema } });
    }
  }

  private findComponentByIdInSteps(id: string, steps: FormStep[]): FormComponent | null {
    for (const step of steps) {
      const found = this.findComponentInArray(id, step.components);
      if (found) return found;
    }
    return null;
  }

  private findComponentInArray(id: string, components: FormComponent[]): FormComponent | null {
    for (const component of components) {
      if (component.id === id) return component;
      if (component.children) {
        const found = this.findComponentInArray(id, component.children);
        if (found) return found;
      }
    }
    return null;
  }

  private deepCopyProperties(properties: any): any {
    if (properties === null || typeof properties !== 'object') {
      return properties;
    }

    if (Array.isArray(properties)) {
      return properties.map(item => this.deepCopyProperties(item));
    }

    const copied: any = {};
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        copied[key] = this.deepCopyProperties(properties[key]);
      }
    }

    return copied;
  }

  // Método para validar se um step é válido
  validateStep(step: FormStep): boolean {
    this.updateComponentsValidation(step.components);
    return step.components.every(component => component.valid !== false);
  }

  // Método recursivo para atualizar validação de componentes
  private updateComponentsValidation(components: FormComponent[]): void {
    for (const component of components) {
      this.updateComponentValidation(component);
    }
  }

  // Método para atualizar a validação de um componente específico
  updateComponentValidation(component: FormComponent): void {
    // Skip validation for Text Help components (they are informational only)
    if (component.type === ComponentType.TEXT_HELP) {
      component.valid = true;
      // Still validate children if any
      if (component.children && component.children.length > 0) {
        this.updateComponentsValidation(component.children);
      }
      return;
    }

    // Primeiro, atualizar validação dos filhos recursivamente
    if (component.children && component.children.length > 0) {
      this.updateComponentsValidation(component.children);
    }

    // Se o componente não deve ser validado (oculto/desabilitado por lógica condicional),
    // considere-o válido para fins de agregação de step
    if (!this.validationService.isComponentValidatable(component, this)) {
      component.valid = true;
      return;
    }

    // Determinar a validação do componente atual
    if (this.isLayoutComponent(component)) {
      // Para componentes de layout (panel, columns), valid depende dos filhos
      component.valid = this.validateLayoutComponent(component);
    } else {
      // Para componentes normais, valid depende se está vazio quando obrigatório
      component.valid = !component.required || !this.isComponentEmpty(component);
    }
  }

  // Método para verificar se é um componente de layout
  private isLayoutComponent(component: FormComponent): boolean {
    return [ComponentType.PANEL, ComponentType.COLUMNS].includes(component.type);
  }

  // Método para validar componentes de layout baseado nos filhos
  private validateLayoutComponent(component: FormComponent): boolean {
    // Se não tem filhos, é válido (layout vazio é ok)
    if (!component.children || component.children.length === 0) {
      return true;
    }

    // Considerar apenas filhos que devem ser validados (não ocultos/desabilitados por lógica condicional)
    const validatableChildren = component.children.filter(child =>
      this.validationService.isComponentValidatable(child, this)
    );

    // Se n��o há filhos validáveis (todos ocultos/desabilitados), layout é válido
    if (validatableChildren.length === 0) {
      return true;
    }

    // Todos os filhos visíveis/validáveis devem ser válidos
    return validatableChildren.every(child => child.valid !== false);
  }

  // Método recursivo legacy para compatibilidade
  private validateComponents(components: FormComponent[]): boolean {
    this.updateComponentsValidation(components);
    return components.every(component => component.valid !== false);
  }

  // Método para verificar se um componente está vazio
  private isComponentEmpty(component: FormComponent): boolean {
    const value = component.value;

    // Se não tem valor definido
    if (value === undefined || value === null) {
      return true;
    }

    // Verifica baseado no tipo de componente
    switch (component.type) {
      case ComponentType.INPUT:
      case ComponentType.PROCESSO_SEI:
      case ComponentType.NUMERO_ETP:
      case ComponentType.TEXTAREA:
      case ComponentType.EMAIL:
      case ComponentType.PASSWORD:
      case ComponentType.URL:
      case ComponentType.TEL:
        return !value || (typeof value === 'string' && value.trim().length === 0);

      case ComponentType.SELECT:
      case ComponentType.RADIO:
        return !value || value === '';

      case ComponentType.SELECT_BOX:
        if (component.properties?.multiple) {
          return !Array.isArray(value) || value.length === 0;
        }
        return !value || value === '';

      case ComponentType.CHECKBOX:
        return value !== true;

      case ComponentType.FILE:
        return !value || (Array.isArray(value) && value.length === 0);

      case ComponentType.DATE:
        return !value;

      case ComponentType.NUMBER:
        return value === undefined || value === null || value === '';

      case ComponentType.RICH_TEXT:
        return !value || (typeof value === 'string' && value.trim().length === 0);

      case ComponentType.DATAGRID:
        // DataGrid is considered empty only if there are no rows
        // Individual cell validation is handled by ValidationService.validateDataGridRows
        if (!component.rows || component.rows.length === 0) {
          return true;
        }

        // If there are rows, consider the DataGrid as not empty
        // Cell-level validation will be handled separately
        return false;

      default:
        return !value;
    }
  }

  // Método auxiliar para verificar se um valor está vazio baseado no tipo
  private isValueEmpty(value: any, componentType: ComponentType): boolean {
    // Se não tem valor definido
    if (value === undefined || value === null) {
      return true;
    }

    // Verifica baseado no tipo de componente
    switch (componentType) {
      case ComponentType.INPUT:
      case ComponentType.PROCESSO_SEI:
      case ComponentType.NUMERO_ETP:
      case ComponentType.TEXTAREA:
      case ComponentType.EMAIL:
      case ComponentType.PASSWORD:
      case ComponentType.URL:
      case ComponentType.TEL:
      case ComponentType.RICH_TEXT:
        return !value || (typeof value === 'string' && value.trim().length === 0);

      case ComponentType.SELECT:
      case ComponentType.RADIO:
        return !value || value === '';

      case ComponentType.SELECT_BOX:
        return !value || value === '' || (Array.isArray(value) && value.length === 0);

      case ComponentType.CHECKBOX:
        return value !== true;

      case ComponentType.FILE:
        return !value || (Array.isArray(value) && value.length === 0);

      case ComponentType.DATE:
        return !value;

      case ComponentType.NUMBER:
        return value === undefined || value === null || value === '';

      default:
        return !value;
    }
  }

  // Método para atualizar a validação de todos os steps
  updateAllStepsValidation(): void {
    const state = this.getCurrentState();

    // Skip updating validation while in builder mode (not preview)
    if (!state.previewMode) {
      return;
    }

    state.formSchema.steps.forEach(step => {
      step.valid = this.validateStep(step);
    });

    this.updateState({ formSchema: { ...state.formSchema } });
  }

  // Método para atualizar toda a validação (componentes e steps)
  updateAllValidation(): void {
    const state = this.getCurrentState();

    // Skip updating validation while in builder mode (not preview)
    if (!state.previewMode) {
      return;
    }

    // Atualizar validação de todos os componentes em todos os steps
    state.formSchema.steps.forEach(step => {
      this.updateComponentsValidation(step.components);
      step.valid = step.components.every(component => component.valid !== false);
    });

    this.updateState({ formSchema: { ...state.formSchema } });
  }

  // ========== MÉTODOS PARA GERENCIAR DADOS SEPARADOS DA ESTRUTURA ==========

  // ========== ANÁLISE: Export/Import apenas de apontamentos e comentários ==========
  exportAnalysisData(): string {
    const state = this.getCurrentState();
    const annotations = { ...(state.annotations || {}) };
    return JSON.stringify({ annotations }, null, 2);
  }

  importAnalysisData(json: string): void {
    let payload: any;
    try {
      payload = JSON.parse(json);
    } catch (e) {
      throw new Error('JSON inválido para análise');
    }

    const annotationsMap = payload?.annotations && typeof payload.annotations === 'object'
      ? payload.annotations
      : (payload && typeof payload === 'object' ? payload : null);

    if (!annotationsMap || Array.isArray(annotationsMap)) {
      throw new Error('Formato inv��lido: esperado objeto com "annotations" ou mapa de anotações');
    }

    // Normaliza: garantir arrays
    const normalized: { [componentId: string]: any[] } = {};
    Object.keys(annotationsMap).forEach(cid => {
      const arr = Array.isArray(annotationsMap[cid]) ? annotationsMap[cid] : [];
      normalized[cid] = arr.map((e: any) => ({ ...e }));
    });

    this.updateState({ annotations: normalized });

    // Initialize lastSavedState to mark imported annotations as saved
    this.resetUnsavedChangesFlag();
  }

  /**
   * Exporta apenas os dados (valores) dos componentes em formato key-value
   * Não inclui a estrutura do formulário
   */
  exportFormData(): string {
    const state = this.getCurrentState();
    const formData: { [key: string]: any } = {};

    // Extrair dados de todos os steps
    state.formSchema.steps.forEach(step => {
      this.extractComponentData(step.components, formData);
    });

    // Incluir apontamentos/notas
    if (state.annotations && Object.keys(state.annotations).length > 0) {
      formData['__annotations'] = state.annotations;
    }

    return JSON.stringify(formData, null, 2);
  }

  /**
   * Debug method to test data export with detailed logging
   */
  debugExportFormData(): { data: any, json: string } {
    const state = this.getCurrentState();
    const formData: { [key: string]: any } = {};

    // Debug cada step
    state.formSchema.steps.forEach((step, stepIndex) => {
      // Debug cada componente no step
      this.debugComponentsForExport(step.components, 0);

      this.extractComponentData(step.components, formData);
    });

    const jsonResult = JSON.stringify(formData, null, 2);

    return {
      data: formData,
      json: jsonResult
    };
  }

  /**
   * Debug helper to log component details
   */
  private debugComponentsForExport(components: FormComponent[], level: number): void {
    const indent = '  '.repeat(level);

    components.forEach(component => {

      if (component.children && component.children.length > 0) {
        this.debugComponentsForExport(component.children, level + 1);
      }
    });
  }

  /**
   * Importa dados (valores) para os componentes do formulário
   * Mantém a estrutura existente e apenas preenche os valores
   */
  importFormData(dataJson: string): void {
    if (!dataJson || (typeof dataJson === 'string' && dataJson.trim() === '')) {
      return;
    }
    try {
      const formData: { [key: string]: any } = JSON.parse(dataJson);
      const state = this.getCurrentState();

      // Aplicar dados a todos os steps
      state.formSchema.steps.forEach(step => {
        this.applyComponentData(step.components, formData);
      });

      // Importar apontamentos/notas, se presentes
      if (formData['__annotations'] && typeof formData['__annotations'] === 'object') {
        this.updateState({ annotations: { ...formData['__annotations'] } });
      }

      // Force state update with new object references to ensure change detection
      const updatedSchema = {
        ...state.formSchema,
        steps: state.formSchema.steps.map(step => ({
          ...step,
          components: [...step.components]
        }))
      };

      this.updateState({ formSchema: updatedSchema });

      // Initialize lastSavedState to mark imported data as saved
      this.resetUnsavedChangesFlag();

      // Atualizar validação após importação dos dados (com pequeno delay para garantir propagação)
      if (state.previewMode) {
        setTimeout(() => {
          this.updateAllValidation();
          this.triggerConditionalLogicUpdate();
        }, 0);
      }
    } catch (error) {
      console.error('Error importing form data:', error);
      throw new Error('Erro ao importar dados: formato JSON inválido');
    }
  }

  /**
   * Limpa todos os dados (valores) dos componentes
   * Mantém a estrutura do formulário intacta
   */
  clearFormData(): void {
    const state = this.getCurrentState();

    state.formSchema.steps.forEach(step => {
      this.clearComponentsData(step.components);
    });

    this.updateState({ formSchema: { ...state.formSchema }, annotations: {} });

    // Atualizar validação após limpar dados
    if (state.previewMode) {
      this.updateAllValidation();
      this.triggerConditionalLogicUpdate();
    }
  }

  /**
   * Extrai dados dos componentes recursivamente
   */
  private extractComponentData(components: FormComponent[], formData: { [key: string]: any }): void {
    components.forEach(component => {
      // Tratamento especial para DataGrid - verificar rows ao invés de value
      if (component.type === ComponentType.DATAGRID && component.key && component.rows && component.rows.length > 0) {
        formData[component.key] = component.rows.map(row => row.data);
      }
      // Para outros componentes, usar a condição normal
      else if (component.key && component.value !== undefined && component.value !== null && component.type !== ComponentType.DATAGRID) {
        // Clean select data before exporting to ensure only original API data is saved
        // This prevents storing SelectOption objects with label/value/originalData/selected
        let valueToExport = component.value;

        // For SELECT_API components, ensure we export clean data
        if (this.isSelectApiType(component)) {
          valueToExport = this.cleanSelectDataForExport(component.value);
        }

        formData[component.key] = valueToExport;
      }

      // Extrair dados de delegação para PANEL components
      if (component.type === ComponentType.PANEL && component.key && component.properties.delegation) {
        const delegation = component.properties.delegation;
        formData[`${component.key}__delegate_checkbox`] = delegation.isDelegated || false;
        if (delegation.delegatedTo) {
          formData[`${component.key}__delegate_server`] = delegation.delegatedTo;
        }
      }

      // Processar componentes filhos recursivamente
      // CORREÇÃO: Para DataGrid, não processar children pois são templates
      // e seus dados já estão extraídos das rows acima
      if (component.children && component.type !== ComponentType.DATAGRID) {
        this.extractComponentData(component.children, formData);
      }
    });
  }

  /**
   * Aplica dados aos componentes recursivamente
   */
  private applyComponentData(components: FormComponent[], formData: { [key: string]: any }): void {
    components.forEach(component => {
      if (component.key && formData.hasOwnProperty(component.key)) {
        const value = formData[component.key];

        // Para DataGrid, aplicar dados às linhas
        if (component.type === ComponentType.DATAGRID && Array.isArray(value)) {
          component.rows = value.map((rowData, index) => ({
            id: this.generateRowId(),
            data: rowData,
            index: index
          }));
          component.value = value;
        } else {
          component.value = value;
        }

        // Sincronizar valor com opções selecionadas para select e radio
        this.syncComponentValueWithOptions(component);
      }

      // Restaurar dados de delegação para PANEL components
      if (component.type === ComponentType.PANEL && component.key) {
        const delegateCheckboxKey = `${component.key}__delegate_checkbox`;
        const delegateServerKey = `${component.key}__delegate_server`;

        if (!component.properties.delegation) {
          component.properties.delegation = { isDelegated: false };
        }

        if (formData.hasOwnProperty(delegateCheckboxKey)) {
          component.properties.delegation.isDelegated = formData[delegateCheckboxKey] === true;
        }

        if (formData.hasOwnProperty(delegateServerKey)) {
          component.properties.delegation.delegatedTo = formData[delegateServerKey];
        }
      }

      // Processar componentes filhos recursivamente
      if (component.children) {
        this.applyComponentData(component.children, formData);
      }
    });
  }

  /**
   * Limpa dados dos componentes recursivamente
   */
  private clearComponentsData(components: FormComponent[]): void {
    components.forEach(component => {
      // Resetar valor para o padrão baseado no tipo
      component.value = this.getDefaultValueForComponent(component);

      // Para DataGrid, limpar linhas
      if (component.type === ComponentType.DATAGRID) {
        component.rows = [];
      }

      // Para componentes com opções, desmarcar todas
      if (component.properties.options) {
        component.properties.options.forEach(option => {
          option.selected = false;
        });
      }

      // Processar componentes filhos recursivamente
      if (component.children) {
        this.clearComponentsData(component.children);
      }
    });
  }

  /**
   * Obtém valor padrão para um componente baseado no tipo
   */
  private getDefaultValueForComponent(component: FormComponent): any {
    switch (component.type) {
      case ComponentType.CHECKBOX:
        return false;
      case ComponentType.SELECT_BOX:
        return component.properties.multiple ? [] : '';
      case ComponentType.SELECT_API:
      case ComponentType.TIPO_CONTRATACAO:
      case ComponentType.UNIDADE:
      case ComponentType.SERVIDOR:
        return component.properties.multiple ? [] : '';
      case ComponentType.NUMBER:
        return '';
      case ComponentType.DATAGRID:
        return [];
      default:
        return '';
    }
  }

  /**
   * Gera ID único para linha do DataGrid
   */
  private generateRowId(): string {
    const maxId = this.getMaxExistingId();
    return `row_${maxId + 1}`;
  }

  /**
   * Helper method to compare SELECT_API values (can be objects or simple values)
   */
  private compareSelectApiValues(value: any, option: any, component: FormComponent): boolean {
    if (component.type !== ComponentType.SELECT_API && component.type !== ComponentType.TIPO_CONTRATACAO && component.type !== ComponentType.UNIDADE && component.type !== ComponentType.SERVIDOR) {
      return value == option.value;
    }

    const config = component.properties.apiConfig;
    const valueField = config?.valueField || 'id';

    // Extract comparison values
    let compareValue: any;
    let optionValue: any;

    if (typeof value === 'object' && value !== null) {
      compareValue = value[valueField] || value.value || value.id || value;
    } else {
      compareValue = value;
    }

    if (typeof option === 'object' && option !== null) {
      optionValue = option.value || option[valueField] || option.id || option;
    } else {
      optionValue = option;
    }

    return compareValue == optionValue;
  }

  /**
   * Check if a component is a SELECT_API type (includes custom types like UNIDADE, TIPO_CONTRATACAO, SERVIDOR)
   */
  private isSelectApiType(component: FormComponent): boolean {
    return component.type === ComponentType.SELECT_API ||
           component.type === ComponentType.TIPO_CONTRATACAO ||
           component.type === ComponentType.UNIDADE ||
           component.type === ComponentType.SERVIDOR;
  }

  /**
   * Clean select data before export to remove SelectOption transformation
   * Converts { label, value, originalData, selected } back to original data format
   * Or extracts originalData if present
   */
  private cleanSelectDataForExport(value: any): any {
    if (!value) {
      return value;
    }

    // Handle arrays (multiple selection)
    if (Array.isArray(value)) {
      return value.map(item => this.cleanSelectItemForExport(item));
    }

    // Handle single value
    return this.cleanSelectItemForExport(value);
  }

  /**
   * Clean a single select item for export
   */
  private cleanSelectItemForExport(item: any): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    // If item has originalData field, extract it (it contains the original API response)
    if ('originalData' in item && item.originalData && typeof item.originalData === 'object') {
      return JSON.parse(JSON.stringify(item.originalData)); // Deep clone to avoid references
    }

    // If item looks like a SelectOption (has label, value, selected) but no originalData
    // Extract only the meaningful fields
    const isTransformedSelectOption = 'label' in item && 'value' in item && ('selected' in item || 'originalData' in item);

    if (isTransformedSelectOption && !('originalData' in item)) {
      // This is a transformed option without originalData - likely partially saved data
      // Extract the fields that look like original API data
      const cleaned: any = {};
      const fieldsToKeep = ['sigla', 'id', 'descricao', 'chave', 'nome', 'matricula', 'label', 'email'];

      for (const field of fieldsToKeep) {
        if (field in item && !['label', 'value', 'selected', 'originalData'].includes(field)) {
          cleaned[field] = item[field];
        }
      }

      // If we extracted any fields, return the cleaned object
      if (Object.keys(cleaned).length > 0) {
        return cleaned;
      }
    }

    // For regular objects, return as-is (they are already in the correct format)
    return item;
  }

  // Método para atualizar validação de um componente e seus pais
  updateComponentAndParentsValidation(componentId: string): void {
    const state = this.getCurrentState();

    // Skip updating validation while in builder mode (not preview)
    if (!state.previewMode) {
      return;
    }

    // Encontrar o componente em todos os steps
    for (const step of state.formSchema.steps) {
      const component = this.findComponentInArray(componentId, step.components);
      if (component) {
        // Atualizar validação do componente
        this.updateComponentValidation(component);

        // Atualizar validação dos pais recursivamente
        this.updateParentComponentsValidation(component, step.components);

        // Atualizar validação do step
        step.valid = step.components.every(comp => comp.valid !== false);

        this.updateState({ formSchema: { ...state.formSchema } });
        break;
      }
    }
  }

  // Método para atualizar validação de componentes pais
  private updateParentComponentsValidation(component: FormComponent, allComponents: FormComponent[]): void {
    if (!component.parentId) return;

    const parent = this.findComponentInArray(component.parentId, allComponents);
    if (parent) {
      this.updateComponentValidation(parent);
      // Recursivamente atualizar pais do pai
      this.updateParentComponentsValidation(parent, allComponents);
    }
  }

  // Change tracking methods
  saveCurrentState(): void {
    const currentState = this.getCurrentState();
    this.updateState({
      lastSavedState: {
        formSchema: this.deepCopyFormSchema(currentState.formSchema),
        annotations: this.deepCopyAnnotations(currentState.annotations || {})
      },
      isDirty: false
    });
  }

  resetChanges(): void {
    const currentState = this.getCurrentState();
    if (currentState.lastSavedState) {
      this.updateState({
        formSchema: this.deepCopyFormSchema(currentState.lastSavedState.formSchema),
        annotations: this.deepCopyAnnotations(currentState.lastSavedState.annotations || {}),
        isDirty: false
      });

      // Refresh properties panel by re-opening it
      this.selectComponent(currentState.selectedComponent?.id)
      this.openPropertiesTab();
    }
  }

  resetUnsavedChangesFlag(): void {
    const currentState = this.getCurrentState();

    this.updateState({
      lastSavedState: {
        formSchema: this.deepCopyFormSchema(currentState.formSchema),
        annotations: this.deepCopyAnnotations(currentState.annotations || {})
      },
      isDirty: false
    });
  }

  /**
   * Checks if there are unsaved changes in the form structure (components, properties, validation)
   * Does NOT include data changes (component values)
   */
  hasUnsavedStructuralChanges(): boolean {
    const currentState = this.getCurrentState();
    if (!currentState.lastSavedState) {
      return false;
    }
    return this.hasFormStructureChanges(currentState.formSchema, currentState.lastSavedState.formSchema) ||
           this.hasAnnotationChanges(currentState.annotations || {}, currentState.lastSavedState.annotations || {});
  }

  /**
   * Checks if there are unsaved changes in form data (component values)
   * Does NOT include structural changes
   * Only compares exported data (values and rows) - not schema structure
   */
  hasUnsavedDataChanges(): boolean {
   
    const currentState = this.getCurrentState();
    if (!currentState.lastSavedState) {
      return false;
    }

    const currentData = this.getFormDataSnapshot(currentState.formSchema, currentState.annotations);
    const savedData = this.getFormDataSnapshot(currentState.lastSavedState.formSchema, currentState.lastSavedState.annotations);

    return this.hasDeepDataChanges(currentData, savedData);
  }

  /**
   * Extracts form data snapshot (values and rows only, no structural data)
   * Returns the same data structure as exportFormData but as an object
   */
  private getFormDataSnapshot(formSchema: FormSchema, annotations?: AnnotationsMap): { [key: string]: any } {
    const formData: { [key: string]: any } = {};

    // Extract data from all steps
    formSchema.steps.forEach(step => {
      this.extractComponentData(step.components, formData);
    });

    // Include annotations if present
    if (annotations && Object.keys(annotations).length > 0) {
      formData['__annotations'] = annotations;
    }

    return formData;
  }

  /**
   * Deep comparison of form data snapshots
   * Compares only the actual data values, not the structure
   */
  private hasDeepDataChanges(current: any, saved: any): boolean {
    return this.hasObjectChanges(current, saved);
  }

  private hasFormSchemaChanges(current: FormSchema, saved: FormSchema): boolean {
    if (!saved) return true;

    // Compare metadata
    if (current.name !== saved.name || current.id !== saved.id) {
      return true;
    }

    // Compare steps length
    if (current.steps.length !== saved.steps.length) {
      return true;
    }

    // Compare each step
    for (let i = 0; i < current.steps.length; i++) {
      if (this.hasStepChanges(current.steps[i], saved.steps[i])) {
        return true;
      }
    }

    return false;
  }

  private hasFormStructureChanges(current: FormSchema, saved: FormSchema): boolean {
    if (!saved) return true;
    // Compare metadata
    if (current.name !== saved.name || current.id !== saved.id) {
      return true;
    }
    // Compare steps length
    if (current.steps.length !== saved.steps.length) {
      return true;
    }

    // Compare each step (structure only)
    for (let i = 0; i < current.steps.length; i++) {

      if (this.hasStepStructureChanges(current.steps[i], saved.steps[i])) {
        return true;
      }
    }

    return false;
  }

  private hasFormDataChanges(current: FormSchema, saved: FormSchema): boolean {

    if (!saved) return true;

    // Compare steps length
    if (current.steps.length !== saved.steps.length) {
      return true;
    }

    // Compare data in each step
    for (let i = 0; i < current.steps.length; i++) {
      if (this.hasStepDataChanges(current.steps[i], saved.steps[i])) {
        return true;
      }
    }

    return false;
  }

  private hasStepChanges(current: FormStep, saved: FormStep): boolean {
    if (!saved) return true;

    // Compare basic properties
    if (current.id !== saved.id ||
        current.title !== saved.title ||
        current.order !== saved.order) {
      return true;
    }

    // Compare description if exists
    if ((current.description || saved.description) &&
        current.description !== saved.description) {
      return true;
    }

    // Compare properties if they exist (includes all properties for this method)
    if (this.hasObjectChanges(current.properties, saved.properties)) {
      return true;
    }

    // Compare components length
    if (current.components.length !== saved.components.length) {
      return true;
    }

    // Compare each component
    for (let i = 0; i < current.components.length; i++) {
      if (this.hasComponentChanges(current.components[i], saved.components[i])) {
        return true;
      }
    }

    return false;
  }

  private hasStepStructureChanges(current: FormStep, saved: FormStep): boolean {
    if (!saved) return true;

    // Compare basic properties
    if (current.id !== saved.id ||
        current.title !== saved.title ||
        current.order !== saved.order) {
      return true;
    }

    // Compare description if exists
    if ((current.description || saved.description) &&
        current.description !== saved.description) {
      return true;
    }

    // Compare structural properties only (ignore external API options)
    if (this.hasStructuralPropertyChanges(current.properties, saved.properties)) {
      return true;
    }

    // Compare components length
    if (current.components.length !== saved.components.length) {
      return true;
    }

    // Compare each component structure (excluding data)
    for (let i = 0; i < current.components.length; i++) {
      if (this.hasComponentStructureChanges(current.components[i], saved.components[i])) {
        return true;
      }
    }

    return false;
  }

  private hasStepDataChanges(current: FormStep, saved: FormStep): boolean {
    if (!saved) return true;

    // Compare components length
    if (current.components.length !== saved.components.length) {
      return true;
    }

    // Compare data in each component
    for (let i = 0; i < current.components.length; i++) {
      if (this.hasComponentDataChanges(current.components[i], saved.components[i])) {
        return true;
      }
    }

    return false;
  }

  private hasComponentChanges(current: FormComponent, saved: FormComponent): boolean {
    if (!saved) return true;

    // Compare basic properties
    if (current.id !== saved.id ||
        current.key !== saved.key ||
        current.type !== saved.type ||
        current.label !== saved.label ||
        current.required !== saved.required ||
        this.hasValueChange(current.value, saved.value, current.type)) {
      return true;
    }

    // Compare properties
    if (this.hasObjectChanges(current.properties, saved.properties)) {
      return true;
    }

    // Compare rows for DataGrid
    if (current.type === ComponentType.DATAGRID) {
      if (this.hasDataGridRowChanges(current.rows, saved.rows)) {
        return true;
      }
    }

    // Compare children if they exist
    if (current.children && saved.children) {
      if (current.children.length !== saved.children.length) {
        return true;
      }
      for (let i = 0; i < current.children.length; i++) {
        if (this.hasComponentChanges(current.children[i], saved.children[i])) {
          return true;
        }
      }
    }

    return false;
  }

  private hasComponentStructureChanges(current: FormComponent, saved: FormComponent): boolean {
    if (!saved) return true;

    // Compare basic properties (structure only, no value)
    if (current.id !== saved.id ||
        current.key !== saved.key ||
        current.type !== saved.type ||
        current.label !== saved.label ||
        current.required !== saved.required) {
      return true;
    }

    // Compare structural properties only (ignore options from external API)
    if (this.hasStructuralPropertyChanges(current.properties, saved.properties)) {
      return true;
    }

    // Compare children if they exist (structure only)
    if (current.children && saved.children) {
      if (current.children.length !== saved.children.length) {
        return true;
      }
      for (let i = 0; i < current.children.length; i++) {
        if (this.hasComponentStructureChanges(current.children[i], saved.children[i])) {
          return true;
        }
      }
    } else if ((current.children && !saved.children) || (!current.children && saved.children)) {
      return true;
    }

    return false;
  }

  private hasComponentDataChanges(current: FormComponent, saved: FormComponent): boolean {
    if (!saved) return true;

    // Compare component values
    if (this.hasValueChange(current.value, saved.value, current.type)) {
      return true;
    }

    // Compare rows for DataGrid
    if (current.type === ComponentType.DATAGRID) {
      if (this.hasDataGridRowChanges(current.rows, saved.rows)) {
        return true;
      }
    }

    // Compare data in children if they exist
    if (current.children && saved.children) {
      if (current.children.length !== saved.children.length) {
        return true;
      }
      for (let i = 0; i < current.children.length; i++) {
        if (this.hasComponentDataChanges(current.children[i], saved.children[i])) {
          return true;
        }
      }
    }

    return false;
  }

  private hasValueChange(current: any, saved: any, type: ComponentType): boolean {
    // Handle arrays (for multiple select, etc.)
    if (Array.isArray(current) || Array.isArray(saved)) {
      if (!Array.isArray(current) || !Array.isArray(saved)) {
        return true;
      }
      if (current.length !== saved.length) {
        return true;
      }
      return current.some((val, idx) => this.hasObjectChanges(val, saved[idx]));
    }

    // Handle objects (for SELECT_API, etc.)
    if (typeof current === 'object' || typeof saved === 'object') {
      return this.hasObjectChanges(current, saved);
    }

    // For other types, direct comparison
    return current !== saved;
  }

  private hasDataGridRowChanges(current?: DataGridRow[], saved?: DataGridRow[]): boolean {
    if (!current || !saved) {
      return current !== saved;
    }
    if (current.length !== saved.length) {
      return true;
    }
    return current.some((row, idx) => this.hasObjectChanges(row.data, saved[idx].data));
  }

  private hasAnnotationChanges(current: AnnotationsMap, saved: AnnotationsMap): boolean {
    const currentKeys = Object.keys(current);
    const savedKeys = Object.keys(saved);

    // Compare number of annotations
    if (currentKeys.length !== savedKeys.length) {
      return true;
    }

    // Compare each component's annotations
    for (const key of currentKeys) {
      if (!saved[key]) {
        return true;
      }
      if (current[key].length !== saved[key].length) {
        return true;
      }
      for (let i = 0; i < current[key].length; i++) {
        if (this.hasObjectChanges(current[key][i], saved[key][i])) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Compare structural properties only, ignoring external API data like options
   */
  private hasStructuralPropertyChanges(current: any, saved: any): boolean {
    if (current === saved) {
      return false;
    }

    if (!current || !saved) {
      return current !== saved;
    }

    // Fields to exclude from structural comparison (external data)
    const excludedFields = ['options', 'selectOptions', 'data', '__options'];

    const currentKeys = Object.keys(current).filter(k => !excludedFields.includes(k));
    const savedKeys = Object.keys(saved).filter(k => !excludedFields.includes(k));

    if (currentKeys.length !== savedKeys.length) {
      return true;
    }

    return currentKeys.some(key => {
      const currentValue = current[key];
      const savedValue = saved[key];

      if (typeof currentValue === 'object' || typeof savedValue === 'object') {
        return this.hasStructuralPropertyChanges(currentValue, savedValue);
      }

      return currentValue !== savedValue;
    });
  }

  private hasObjectChanges(current: any, saved: any): boolean {
    if (current === saved) {
      return false;
    }

    if (!current || !saved) {
      return current !== saved;
    }

    const currentKeys = Object.keys(current);
    const savedKeys = Object.keys(saved);

    if (currentKeys.length !== savedKeys.length) {
      return true;
    }

    return currentKeys.some(key => {
      const currentValue = current[key];
      const savedValue = saved[key];

      if (typeof currentValue === 'object' || typeof savedValue === 'object') {
        return this.hasObjectChanges(currentValue, savedValue);
      }

      return currentValue !== savedValue;
    });
  }

  private deepCopyFormSchema(schema: FormSchema): FormSchema {
    return {
      ...schema,
      metadata: { ...schema.metadata },
      steps: schema.steps.map(step => ({
        ...step,
        components: this.deepCopyComponents(step.components),
        properties: step.properties ? { ...step.properties } : undefined
      }))
    };
  }

  private deepCopyComponents(components: FormComponent[]): FormComponent[] {
    return components.map(comp => ({
      ...comp,
      properties: this.deepCopyProperties(comp.properties),
      children: comp.children ? this.deepCopyComponents(comp.children) : undefined,
      rows: comp.rows ? comp.rows.map(row => ({
        ...row,
        data: { ...row.data }
      })) : undefined
    }));
  }

  private deepCopyAnnotations(annotations: AnnotationsMap): AnnotationsMap {
    const copy: AnnotationsMap = {};
    Object.keys(annotations).forEach(key => {
      copy[key] = annotations[key].map((ann: AnnotationEntry) => ({
        ...ann
      }));
    });
    return copy;
  }

  // Delegation event methods
  emitDelegationEvent(data: any): void {
    this.delegationEventSubject.next(data);
  }

  getApiConfigServidor() : any {
        return {
        url: this.environmenter.apiFormulario + '/sarhclient/listaservidores?limit=' + this.environmenter.formioLimitReturnAPI,
        method: 'GET',
        headers: {},
        token: '',
        labelField: "nome",
        valueField: 'matricula',
        labelTemplate: '{matricula} - {nome} - {siglaUnidade}',
        requestBody: '',
        cache: true,
        cacheTimeout: 30,
      };
  }

  /**
   * Expands all subpanels of a given panel component
   * Recursively sets panelCollapsed to false for the panel and all child panels
   * @param panelId - The ID of the panel to expand
   */
  expandAllSubpanels(panelId: string): void {
    const state = this.getCurrentState();
    const panel = this.findParentPanelOfComponent(state.formSchema, panelId);

    if (panel && panel.type === ComponentType.PANEL) {
      this.expandPanelRecursive(panel);
      // Update state to persist the changes
      this.updateState({ formSchema: { ...state.formSchema } });
    }
  }

  /**
   * Recursively expands a panel and all its child panels
   * @param component - The component to expand (should be a panel)
   */
  private expandPanelRecursive(component: FormComponent): void {
    // Expand the current panel if it's collapsible
    if (component.type === ComponentType.PANEL && component.properties.collapsible) {
      (component.properties as any).panelCollapsed = false;
    }

    // Recursively expand all child panels
    if (component.children && component.children.length > 0) {
      for (const child of component.children) {
        if (child.type === ComponentType.PANEL) {
          this.expandPanelRecursive(child);
        }
      }
    }
  }

  /**
   * Finds a component by ID across all steps
   * @param formSchema - The form schema to search in
   * @param componentId - The ID of the component to find
   * @returns The found component or null
   */
  private findComponentInAllSteps(formSchema: FormSchema, componentId: string): FormComponent | null {
    for (const step of formSchema.steps) {
      const found = this.findComponentInArray(componentId, step.components);
      if (found) return found;
    }
    return null;
  }

  /**
   * Finds the parent panel of a component by its ID across all steps
   * If the component itself is a panel, returns the component
   * If the component is nested within a panel, returns the containing panel
   * @param formSchema - The form schema to search in
   * @param componentId - The ID of the component to find its parent panel
   * @returns The parent panel or the component if it's a panel, or null if not found
   */
  private findParentPanelOfComponent(formSchema: FormSchema, componentId: string): FormComponent | null {
    for (const step of formSchema.steps) {
      const found = this.findParentPanelInArray(componentId, step.components);
      if (found) return found;
    }
    return null;
  }

  /**
   * Helper method to recursively find the parent panel of a component within an array
   * @param componentId - The ID of the component to find its parent panel
   * @param components - The array of components to search in
   * @param parentPanel - The current parent panel context (starts as null, tracked during recursion)
   * @returns The parent panel or the component if it's a panel, or null if not found
   */
  private findParentPanelInArray(componentId: string, components: FormComponent[], parentPanel: FormComponent | null = null): FormComponent | null {
    for (const component of components) {
      if (component.id === componentId) {
        // If the found component is a panel, return it
        if (component.type === ComponentType.PANEL) {
          return component;
        }
        // Otherwise, return the parent panel
        return parentPanel;
      }

      // If current component is a panel, it becomes the parent for its children
      const currentParent = component.type === ComponentType.PANEL ? component : parentPanel;

      if (component.children && component.children.length > 0) {
        const found = this.findParentPanelInArray(componentId, component.children, currentParent);
        if (found) return found;
      }
    }
    return null;
  }

}
