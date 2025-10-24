import { Injectable } from '@angular/core';
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
  ConditionalLogic
} from '../models/form-builder.models';
import FunctionAux from '../function/functions.aux';
import { ValidationService } from './validation.service';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {

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

  private componentTemplates: ComponentTemplate[] = [
    {
      type: ComponentType.INPUT,
      label: 'Campo de Texto',
      icon: 'bi-input-cursor-text',
      category: ComponentCategory.BASIC,
      description: 'Entrada de texto de linha única',
      defaultProperties: { placeholder: 'Enter text...' }
    },
    {
      type: ComponentType.TEXTAREA,
      label: 'Área de Texto',
      icon: 'bi-textarea-resize',
      category: ComponentCategory.BASIC,
      description: 'Entrada de texto multilinha',
      defaultProperties: { rows: 4, placeholder: 'Enter description...' }
    },
    {
      type: ComponentType.SELECT,
      label: 'Selecione',
      icon: 'bi-menu-button-wide',
      category: ComponentCategory.BASIC,
      description: 'Lista de Seleção',
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
      defaultProperties: {}
    },
    {
      type: ComponentType.RADIO,
      label: 'Botão de Opção',
      icon: 'bi-record-circle',
      category: ComponentCategory.BASIC,
      description: 'Seleção única entre várias op��ões',
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
      defaultProperties: {}
    },
    {
      type: ComponentType.FILE,
      label: 'Upload de arquivo',
      icon: 'bi-cloud-upload',
      category: ComponentCategory.BASIC,
      description: 'Entrada de upload de arquivo',
      defaultProperties: { accept: '*/*' }
    },
    {
      type: ComponentType.NUMBER,
      label: 'Entrada de número',
      icon: 'bi-123',
      category: ComponentCategory.BASIC,
      description: 'Entrada numérica com valida��ão',
      defaultProperties: { min: 0, max: 100, step: 1 }
    },
    {
      type: ComponentType.EMAIL,
      label: 'Entrada de e-mail',
      icon: 'bi-envelope',
      category: ComponentCategory.BASIC,
      description: 'Entrada de endereço de e-mail com validação',
      defaultProperties: { placeholder: 'email@example.com' }
    },
    {
      type: ComponentType.RICH_TEXT,
      label: 'Editor Rico',
      icon: 'bi-text-paragraph',
      category: ComponentCategory.BASIC,
      description: 'Editor de rico com recursos de formatação',
      defaultProperties: {
        placeholder: 'Digite o texto...',
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
          cacheTimeout: 30
        }
      }
    },
    {
      type: ComponentType.TEXT_HELP,
      label: 'Text Help',
      icon: 'bi-question-circle',
      category: ComponentCategory.BASIC,
      description: 'Texto de ajuda com formatação rica',
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
    this.stateSubject.next({ ...currentState, ...updates });
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
       key = this.generateUniqueKeyPAR(template.label, id );
    }

    // Deep copy properties to avoid shared references
    let properties = {};
    if (template?.defaultProperties) {
      properties = this.deepCopyProperties(template.defaultProperties);
    }

    const component: FormComponent = {
      id,
      key,
      type,
      label: '', // Start with empty label to show placeholder
      required: true,
      properties,
      children: this.isContainerType(type) ? [] : undefined,
      parentId
    };

    // Initialize rows for DataGrid with one sample row
    if (type === ComponentType.DATAGRID) {
      component.rows = [];
      // DataGrid starts empty - columns are added by dragging components
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

  selectComponent(componentId: string | null): void {
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

  exportFormSchema(): string {
    const state = this.getCurrentState();
    return JSON.stringify(state.formSchema, null, 2);
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
      tipocontratacaoselect: ComponentType.SELECT_API,
      unidadeselect: ComponentType.SELECT_API,
      servidorselect: ComponentType.SELECT_API,
      processoseitextfield: ComponentType.INPUT,
      numeroetptextfield: ComponentType.INPUT
    };

    const formioType = String(src.type || '').toLowerCase();
    const mappedType = typeMap[formioType] || ComponentType.INPUT;

    // ID deve vir do 'key' do Form.io quando existir
    const registry = usedIds || new Set<string>();
    let desiredId = this.sanitizeId(String(src.key || ''));
    if (!desiredId) desiredId = this.generateIdPAR();
    let finalId = desiredId;
    let counter = 1;
    while (registry.has(finalId)) {
      finalId = `${desiredId}_${counter++}`;
    }
    registry.add(finalId);

    // Para painéis, o "label" deve vir do campo "title" do Form.io
    const computedLabel = (mappedType === ComponentType.PANEL)
      ? (src.title || src.label || 'Seção')
      : (src.label || src.title || formioType || 'Campo');

    // A chave segue o key do Form.io quando existir; caso contrário, gerar
    const key = src.key ? String(src.key) : this.generateUniqueKeyPAR(computedLabel, finalId, '');

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

    // Lógica condicional
    if (src.conditional && (src.conditional.when || src.conditional.show !== undefined)) {
      base.properties.conditional = {
        show: String(!!src.conditional.show) as 'true' | 'false',
        when: src.conditional.when || '',
        eq: src.conditional.eq != null ? String(src.conditional.eq) : ''
      } as any;
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
        base.properties.ckEditorConfig = {
          toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo'],
          height: src.rows ? Math.max(120, Math.min(800, src.rows * 40)) : 200,
          language: 'pt-br'
        };
        base.placeholder = src.placeholder || '';
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
            cacheTimeout: 30
          };
        }
        break;
      }
      case ComponentType.SELECT_API: {
        base.properties.multiple = !!src.multiple;
        base.properties.options = [];
        let url, label, value = '';
        if(src.type == 'unidadeselect') {
          url = 'https://my-json-server.typicode.com/jacksonbragarodrigues/dados/unidades'
          label = 'descricao';
          value = 'sigla';
        }

        if(src.type == 'servidorselect') {
          url = 'https://my-json-server.typicode.com/jacksonbragarodrigues/dados/servidores'
          label = 'nome';
          value = 'matricula';
        }

        if(src.type == 'tipocontratacaoselect') {
          url = 'https://my-json-server.typicode.com/jacksonbragarodrigues/dados/tipos-contratacao'
          label = 'nome';
          value = 'codigo';
        }

        base.properties.apiConfig = {
          url: url,
          method: 'GET',
          headers: this.extractHeaders(src.data?.headers),
          labelField: label,
          valueField: value,
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

    // Máscara
    if (src.inputMask || src.displayMask) {
      base.properties.mask = src.inputMask || src.displayMask;
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

      // Processar componentes filhos recursivamente
      if (component.children) {
        this.normalizeComponents(component.children);
      }
    });
  }

  // Método para sincronizar valor do componente com opções selecionadas
  private syncComponentValueWithOptions(component: FormComponent): void {
    if (component.type === ComponentType.SELECT ||
        component.type === ComponentType.RADIO ||
        component.type === ComponentType.SELECT_BOX ||
        component.type === ComponentType.SELECT_API) {

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
        // Para SELECT_API components
        else if (component.type === ComponentType.SELECT_API) {
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

  public generateUniqueKeyPAR(label: string, id:string, key: string = ""): string {
    // Generate a unique key based on component type
    return this.functionAux.createKeyApi(label, id, key);
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
getAllComponentKeyValues(): { id: string, key: string , name: string }[] {
  const state = this.getCurrentState();
  const keyValues: { id: string, key: string, name: string }[] = [];

  const extractKeyValues = (components: FormComponent[]) => {
    components.forEach(component => {
      if (component.key) {
        keyValues.push({
          id: component.id,
          key: component.key,
          name: component.label || String(component.type) || ''
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
      case ComponentType.SELECT_API: {
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
      throw new Error('Formato inválido: esperado objeto com "annotations" ou mapa de anotações');
    }

    // Normaliza: garantir arrays
    const normalized: { [componentId: string]: any[] } = {};
    Object.keys(annotationsMap).forEach(cid => {
      const arr = Array.isArray(annotationsMap[cid]) ? annotationsMap[cid] : [];
      normalized[cid] = arr.map((e: any) => ({ ...e }));
    });

    this.updateState({ annotations: normalized });
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
    console.log('=== Debug Export Form Data ===');
    const state = this.getCurrentState();
    const formData: { [key: string]: any } = {};

    console.log('Form Schema Steps:', state.formSchema.steps.length);

    // Debug cada step
    state.formSchema.steps.forEach((step, stepIndex) => {
      console.log(`Step ${stepIndex + 1} (${step.title}):`, {
        componentsCount: step.components.length,
        stepId: step.id
      });

      // Debug cada componente no step
      this.debugComponentsForExport(step.components, 0);

      this.extractComponentData(step.components, formData);
    });

    const jsonResult = JSON.stringify(formData, null, 2);

    console.log('Final Exported Data:', formData);
    console.log('=== End Debug Export ===');

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
      console.log(`${indent}Component:`, {
        id: component.id,
        key: component.key,
        type: component.type,
        label: component.label,
        hasValue: component.value !== undefined && component.value !== null,
        value: component.value,
        hasRows: component.rows ? component.rows.length : 0,
        rows: component.rows,
        hasChildren: component.children ? component.children.length : 0
      });

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
        formData[component.key] = component.value;
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
    if (component.type !== ComponentType.SELECT_API) {
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

}
