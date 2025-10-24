import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilderService } from '../../services/form-builder.service';
import { FormComponent, FormBuilderState, ComponentType, SelectOption, ValidationRule, ValidationType } from '../../models/form-builder.models';
import { HierarchyTreeComponent } from '../hierarchy-tree/hierarchy-tree.component';
import { CkEditorModalComponent } from '../ck-editor-modal/ck-editor-modal.component';
import { SelectDropDownModule } from 'ngx-select-dropdown';

// Type for conditional when field that can handle different formats
type ConditionalWhenValue = string | string[] | {id: string, name: string}[] | {id: string, name: string};

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, HierarchyTreeComponent, CkEditorModalComponent, SelectDropDownModule],
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent implements OnInit, OnDestroy, AfterViewInit {
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
    dragInProgress: false
  };

  config = {
    displayKey: "name", 
    search: true,       
    height: '300px',
    placeholder: 'Selecione uma opção',
    customComparator: () => 0, 
    limitTo: 0, 
    moreText: 'mais',
    noResultsFound: 'Nenhum resultado!',
    searchPlaceholder: 'Pesquisar',
    clearOnSelection: false,
    inputDirection: 'ltr'
  };

  searchTerm = '';
  activeTab: 'properties' | 'hierarchy' = 'properties';
  ComponentType = ComponentType;
  ValidationType = ValidationType;

  // Form properties
  componentLabel: string = '';
  componentPlaceholder: string = '';
  componentRequired: boolean = false;
  componentDisabled: boolean = false;
  componentReadonly: boolean = false;
  componentHidden: boolean = false;
  componentHideLabel: boolean = false;
  componentClasses: string = '';
  componentId: string = '';
  componentHelpText: string = '';
  componentTooltip: string = '';
  componentPrefix: string = '';
  componentMask: string = '';
  componentLayoutHorizontal: boolean = false;
  componentCollapsible: boolean = false;
  componentInitCollapsed: boolean = false;
  componentKey: string = '';

  // Conditional logic properties
  conditionalShow: string = 'true';
  conditionalWhen: ConditionalWhenValue = [];
  conditionalEq: string = '';
  availableComponentKeys: string[] = [];
  availableComponentKeysValues: { id: string, key: string, name: string }[] = [];
  conditionalWhenComponentOptions: SelectOption[] = []; // Options from the selected when component

  // Validation properties
  minLength: number | null = null;
  maxLength: number | null = null;
  minValue: number | null = null;
  maxValue: number | null = null;
  pattern: string = '';

  // Component specific properties
  textareaRows: number = 4;
  textareaCols: number | null = null;
  fileAccept: string = '';
  multipleSelection: boolean = false;
  numberStep: number = 1;

  // Options for select/radio
  options: SelectOption[] = [];
  newOptionLabel: string = '';
  newOptionValue: string = '';

  // CKEditor specific properties
  ckEditorHeight: number = 200;
  ckEditorLanguage: string = 'pt-br';
  ckEditorToolbar: string[] = ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo'];
  ckEditorToolbarString: string = 'heading,|,bold,italic,link,bulletedList,numberedList,|,outdent,indent,|,blockQuote,insertTable,|,undo,redo';

  // Confidentiality property
  allowsConfidentiality: boolean = false;

  // API Select specific properties
  apiUrl: string = '';
  apiMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
  apiToken: string = '';
  apiLabelField: string = 'name';
  apiValueField: string = 'id';
  apiHeaders: string = '';
  apiRequestBody: string = '';
  apiCache: boolean = true;
  apiCacheTimeout: number = 30;

  // Text Help specific properties
  helpText: string = '';
  onlyInternal: boolean = false;

  @ViewChild(CkEditorModalComponent) ckEditorModal!: CkEditorModalComponent;

  // Step specific properties
  stepTitle: string = '';
  stepDisabled: boolean = false;
  stepInvisible: boolean = false;
  stepConditionalShow: string = 'true';
  stepConditionalWhen: ConditionalWhenValue = [];
  stepConditionalEq: string = '';
  stepConditionalWhenComponentOptions: SelectOption[] = []; // Options from the selected when component for steps

  private destroy$ = new Subject<void>();

  private normalizeWhenField(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value.join(',').trim();
    }
    return (value || '').toString().trim();
  }

  constructor(
    private formBuilderService: FormBuilderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formBuilderService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        this.loadComponentProperties();
        this.loadStepProperties();
        // Keep properties tab active while there is a selection
        if ((this.state.selectedComponent || this.state.selectedStep) && this.activeTab !== 'properties') {
          this.activeTab = 'properties';
        }
      });

    // Listen for properties tab opening events
    this.formBuilderService.openPropertiesTab$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.setActiveTab('properties');
      });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: 'properties' | 'hierarchy'): void {
    this.activeTab = tab;
  }

  private loadComponentProperties(): void {
    const component = this.state.selectedComponent;
    if (!component) {
      this.resetForm();
      return;
    }

    // Basic properties
    this.componentLabel = component.label;
    this.componentPlaceholder = component.placeholder || '';
    this.componentRequired = component.required;
    this.componentId = component.id;

    // Properties object
    this.componentDisabled = component.properties.disabled || false;
    this.componentReadonly = component.properties.readonly || false;
    this.componentHidden = component.properties.hidden || false;
    this.componentHideLabel = component.properties.hideLabel || false;
    this.componentClasses = component.properties.classes?.join(' ') || '';
    this.componentHelpText = component.properties.attributes?.['help-text'] || '';
    this.componentTooltip = component.properties.tooltip || '';
    this.componentPrefix = component.properties.prefix || '';
    this.componentMask = component.properties.mask || '';
    this.componentLayoutHorizontal = component.properties.layoutHorizontal || false;
    this.componentCollapsible = component.properties.collapsible || false;
    this.componentInitCollapsed = component.properties.initCollapsed || false;
    this.componentKey = component.key || '';

    // Conditional logic properties
    this.conditionalShow = component.properties.conditional?.show || 'true';
    // Convert stored ID arrays back to dropdown object format
    const whenVal = component.properties.conditional?.when;
    if (Array.isArray(whenVal)) {
      // Convert ID strings to objects that ngx-select-dropdown expects
      this.conditionalWhen = whenVal.map(id => {
        const componentOption = this.formBuilderService.getAllComponentKeyValues().find(opt => opt.id === id);
        return componentOption || { id: id, name: id }; // fallback if component not found
      }).filter(Boolean);
    } else if (typeof whenVal === 'string' && whenVal.trim()) {
      // Convert single ID to object
      const componentOption = this.formBuilderService.getAllComponentKeyValues().find(opt => opt.id === whenVal);
      this.conditionalWhen = componentOption ? [componentOption] : [];
    } else {
      this.conditionalWhen = [];
    }
    this.conditionalEq = component.properties.conditional?.eq || '';

    // Load available component keys for conditional logic
    this.loadAvailableComponentKeys();
    this.loadAvailableComponentKeysValues();
    this.loadConditionalWhenComponentOptions();

    // Validation properties
    this.minLength = component.properties.minLength || null;
    this.maxLength = component.properties.maxLength || null;
    this.minValue = component.properties.min || null;
    this.maxValue = component.properties.max || null;
    this.pattern = component.properties.pattern || '';

    // Component specific properties
    this.textareaRows = component.properties.rows || 4;
    this.textareaCols = component.properties.cols || null;
    this.fileAccept = component.properties.accept || '';
    this.multipleSelection = component.properties.multiple || false;
    this.numberStep = component.properties.step || 1;

    // Options
    this.options = component.properties.options ? [...component.properties.options] : [];

    // CKEditor properties
    this.ckEditorHeight = component.properties.ckEditorConfig?.height || 200;
    this.ckEditorLanguage = component.properties.ckEditorConfig?.language || 'pt-br';
    this.ckEditorToolbar = component.properties.ckEditorConfig?.toolbar || ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo'];
    this.ckEditorToolbarString = this.ckEditorToolbar.join(',');

    // API Select properties
    this.apiUrl = component.properties.apiConfig?.url || '';
    this.apiMethod = component.properties.apiConfig?.method || 'GET';
    this.apiToken = component.properties.apiConfig?.token || '';
    this.apiLabelField = component.properties.apiConfig?.labelField || 'name';
    this.apiValueField = component.properties.apiConfig?.valueField || 'id';
    this.apiHeaders = component.properties.apiConfig?.headers ? JSON.stringify(component.properties.apiConfig.headers, null, 2) : '';
    this.apiRequestBody = component.properties.apiConfig?.requestBody ? JSON.stringify(component.properties.apiConfig.requestBody, null, 2) : '';
    this.apiCache = component.properties.apiConfig?.cache !== false;
    this.apiCacheTimeout = component.properties.apiConfig?.cacheTimeout || 30;

    // Confidentiality property
    this.allowsConfidentiality = component.properties.allowsConfidentiality || false;

    // Text Help properties
    this.helpText = component.properties.help || '';
    this.onlyInternal = component.properties.onlyInternal || false;
  }

  private resetForm(): void {
    this.componentLabel = '';
    this.componentPlaceholder = '';
    this.componentRequired = false;
    this.componentDisabled = false;
    this.componentReadonly = false;
    this.componentHidden = false;
    this.componentHideLabel = false;
    this.componentClasses = '';
    this.componentId = '';
    this.componentHelpText = '';
    this.componentTooltip = '';
    this.componentPrefix = '';
    this.componentMask = '';
    this.componentLayoutHorizontal = false;
    this.componentCollapsible = false;
    this.componentInitCollapsed = false;
    this.componentKey = '';
    this.conditionalShow = 'true';
    this.conditionalWhen = [];
    this.conditionalEq = '';
    this.availableComponentKeys = [];
    this.minLength = null;
    this.maxLength = null;
    this.minValue = null;
    this.maxValue = null;
    this.pattern = '';
    this.textareaRows = 4;
    this.textareaCols = null;
    this.fileAccept = '';
    this.multipleSelection = false;
    this.numberStep = 1;
    this.options = [];
    this.newOptionLabel = '';
    this.newOptionValue = '';
    this.helpText = '';
    this.onlyInternal = false;
    this.ckEditorHeight = 200;
    this.ckEditorLanguage = 'pt-br';
    this.ckEditorToolbar = ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo'];
    this.ckEditorToolbarString = 'heading,|,bold,italic,link,bulletedList,numberedList,|,outdent,indent,|,blockQuote,insertTable,|,undo,redo';
    this.apiUrl = '';
    this.apiMethod = 'GET';
    this.apiToken = '';
    this.apiLabelField = 'name';
    this.apiValueField = 'id';
    this.apiHeaders = '';
    this.apiRequestBody = '';
    this.apiCache = true;
    this.apiCacheTimeout = 30;
    this.allowsConfidentiality = false;

    // Reset step properties
    this.resetStepForm();
  }

  updateProperty(propertyPath: string, value: any): void {
    if (!this.state.selectedComponent) return;

    const updates: Partial<FormComponent> = {};
    
    switch (propertyPath) {
      case 'label':
        updates.label = value;
        console.log(this.componentKey);
        const key = this.formBuilderService.generateUniqueKeyPAR(value, this.componentId, this.componentKey)
        updates.key = key;
        break;
      case 'placeholder':
        updates.placeholder = value;
        break;
      case 'required':
        updates.required = value;
        break;
      case 'properties.disabled':
        updates.properties = { ...this.state.selectedComponent.properties, disabled: value };
        break;
      case 'properties.readonly':
        updates.properties = { ...this.state.selectedComponent.properties, readonly: value };
        break;
      case 'properties.hidden':
        updates.properties = { ...this.state.selectedComponent.properties, hidden: value };
        break;
      case 'properties.hideLabel':
        updates.properties = { ...this.state.selectedComponent.properties, hideLabel: value };
        break;
      case 'properties.classes':
        const classes = value ? value.split(' ').filter((c: string) => c.trim()) : [];
        updates.properties = { ...this.state.selectedComponent.properties, classes };
        break;
      case 'properties.helpText':
        const attributes = { ...this.state.selectedComponent.properties.attributes, 'help-text': value };
        updates.properties = { ...this.state.selectedComponent.properties, attributes };
        break;
      case 'properties.minLength':
        updates.properties = { ...this.state.selectedComponent.properties, minLength: value };
        break;
      case 'properties.maxLength':
        updates.properties = { ...this.state.selectedComponent.properties, maxLength: value };
        break;
      case 'properties.min':
        updates.properties = { ...this.state.selectedComponent.properties, min: value };
        break;
      case 'properties.max':
        updates.properties = { ...this.state.selectedComponent.properties, max: value };
        break;
      case 'properties.pattern':
        updates.properties = { ...this.state.selectedComponent.properties, pattern: value };
        break;
      case 'properties.rows':
        updates.properties = { ...this.state.selectedComponent.properties, rows: value };
        break;
      case 'properties.cols':
        updates.properties = { ...this.state.selectedComponent.properties, cols: value };
        break;
      case 'properties.accept':
        updates.properties = { ...this.state.selectedComponent.properties, accept: value };
        break;
      case 'properties.multiple':
        updates.properties = { ...this.state.selectedComponent.properties, multiple: value };
        break;
      case 'properties.step':
        updates.properties = { ...this.state.selectedComponent.properties, step: value };
        break;
      case 'properties.options':
        updates.properties = { ...this.state.selectedComponent.properties, options: value };
        break;
      case 'properties.tooltip':
        updates.properties = { ...this.state.selectedComponent.properties, tooltip: value };
        break;
      case 'properties.prefix':
        updates.properties = { ...this.state.selectedComponent.properties, prefix: value };
        break;
      case 'properties.mask':
        updates.properties = { ...this.state.selectedComponent.properties, mask: value };
        break;
      case 'properties.layoutHorizontal':
        updates.properties = { ...this.state.selectedComponent.properties, layoutHorizontal: value };
        break;
      case 'properties.collapsible':
        updates.properties = { ...this.state.selectedComponent.properties, collapsible: value };
        break;
      case 'properties.initCollapsed':
        updates.properties = { ...this.state.selectedComponent.properties, initCollapsed: value };
        break;
      case 'key':
        updates.key = value;
        break;
      case 'properties.conditional':
        updates.properties = { ...this.state.selectedComponent.properties, conditional: value };
        break;
      case 'properties.apiConfig':
        updates.properties = { ...this.state.selectedComponent.properties, apiConfig: value };
        break;
      case 'properties.allowsConfidentiality':
        updates.properties = { ...this.state.selectedComponent.properties, allowsConfidentiality: value };
        break;
      case 'properties.help':
        updates.properties = { ...this.state.selectedComponent.properties, help: value };
        break;
      case 'properties.onlyInternal':
        updates.properties = { ...this.state.selectedComponent.properties, onlyInternal: value };
        break;
    }

    this.formBuilderService.updateComponent(this.state.selectedComponent.id, updates);
  }

  onLabelChange(): void {
    this.updateProperty('label', this.componentLabel);
  }

  onPlaceholderChange(): void {
    this.updateProperty('placeholder', this.componentPlaceholder);
  }

  onRequiredChange(): void {
    this.updateProperty('required', this.componentRequired);
  }

  onDisabledChange(): void {
    this.updateProperty('properties.disabled', this.componentDisabled);
  }

  onReadonlyChange(): void {
    this.updateProperty('properties.readonly', this.componentReadonly);
  }

  onHiddenChange(): void {
    this.updateProperty('properties.hidden', this.componentHidden);
  }

  onHideLabelChange(): void {
    this.updateProperty('properties.hideLabel', this.componentHideLabel);
  }

  onClassesChange(): void {
    this.updateProperty('properties.classes', this.componentClasses);
  }


  onMinLengthChange(): void {
    this.updateProperty('properties.minLength', this.minLength);
  }

  onMaxLengthChange(): void {
    this.updateProperty('properties.maxLength', this.maxLength);
  }

  onMinValueChange(): void {
    this.updateProperty('properties.min', this.minValue);
  }

  onMaxValueChange(): void {
    this.updateProperty('properties.max', this.maxValue);
  }

  onPatternChange(): void {
    this.updateProperty('properties.pattern', this.pattern);
  }

  onRowsChange(): void {
    this.updateProperty('properties.rows', this.textareaRows);
  }

  onColsChange(): void {
    this.updateProperty('properties.cols', this.textareaCols);
  }

  onAcceptChange(): void {
    this.updateProperty('properties.accept', this.fileAccept);
  }

  onMultipleChange(): void {
    this.updateProperty('properties.multiple', this.multipleSelection);
  }

  onStepChange(): void {
    this.updateProperty('properties.step', this.numberStep);
  }

  onTooltipChange(): void {
    this.updateProperty('properties.tooltip', this.componentTooltip);
  }

  onPrefixChange(): void {
    this.updateProperty('properties.prefix', this.componentPrefix);
  }

  onMaskChange(): void {
    this.updateProperty('properties.mask', this.componentMask);
  }

  onLayoutHorizontalChange(): void {
    this.updateProperty('properties.layoutHorizontal', this.componentLayoutHorizontal);
  }

  onCollapsibleChange(): void {
    this.updateProperty('properties.collapsible', this.componentCollapsible);
    // If collapsible is disabled, also disable initCollapsed
    if (!this.componentCollapsible) {
      this.componentInitCollapsed = false;
      this.updateProperty('properties.initCollapsed', this.componentInitCollapsed);
    }
  }

  onInitCollapsedChange(): void {
    this.updateProperty('properties.initCollapsed', this.componentInitCollapsed);
  }

  onKeyChange(): void {
    this.updateProperty('key', this.componentKey);
  }

  onConditionalShowChange(): void {
    this.updateConditionalLogic();
  }

  onConditionalWhenChange(): void {
    this.loadConditionalWhenComponentOptions();
    this.updateConditionalLogic();
  }

  onConditionalEqChange(): void {
    this.updateConditionalLogic();
  }

  private updateConditionalLogic(): void {
    // Build normalized array from local field
    let whenArray: string[] = [];

    if (Array.isArray(this.conditionalWhen)) {
      // Handle array case - extract IDs from objects or use strings directly
      whenArray = this.conditionalWhen.map(item => {
        if (typeof item === 'object' && item !== null && item.id) {
          return item.id.toString().trim();
        }
        return (item || '').toString().trim();
      }).filter(Boolean);
    } else if (typeof this.conditionalWhen === 'object' && this.conditionalWhen !== null) {
      // Handle single object case from ngx-select-dropdown
      if (this.conditionalWhen.id) {
        whenArray = [this.conditionalWhen.id.toString().trim()];
      }
    } else if (typeof this.conditionalWhen === 'string' && this.conditionalWhen.trim()) {
      // Handle string case
      whenArray = this.conditionalWhen.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Only save conditional logic if whenArray has items
    if (whenArray.length > 0) {
      const conditional = {
        show: this.conditionalShow,
        when: whenArray,
        eq: this.conditionalEq
      };
      this.updateProperty('properties.conditional', conditional);
    } else {
      // Remove conditional logic if 'when' field is empty
      this.updateProperty('properties.conditional', undefined);
    }
  }

  private loadAvailableComponentKeys(): void {
    this.availableComponentKeys = this.formBuilderService.getAllComponentKeys()
      .filter(key => key !== this.componentKey); // Exclude current component
  }

  private loadAvailableComponentKeysValues(): void {
    this.availableComponentKeysValues = this.formBuilderService.getAllComponentKeyValues()
      .filter(kv => kv.id !== this.componentId); // Exclude current component
  }

  private loadStepProperties(): void {
    const step = this.state.selectedStep;
    if (!step) {
      this.resetStepForm();
      return;
    }

    // Load step properties
    this.stepTitle = step.properties?.title || step.title || '';
    this.stepDisabled = step.properties?.disabled || false;
    this.stepInvisible = step.properties?.invisible || false;

    // Conditional logic properties
    this.stepConditionalShow = step.properties?.conditional?.show || 'true';
    // Convert stored ID arrays back to dropdown object format
    const stepWhenVal = step.properties?.conditional?.when;
    if (Array.isArray(stepWhenVal)) {
      // Convert ID strings to objects that ngx-select-dropdown expects
      this.stepConditionalWhen = stepWhenVal.map(id => {
        const componentOption = this.formBuilderService.getAllComponentKeyValues().find(opt => opt.id === id);
        return componentOption || { id: id, name: id }; // fallback if component not found
      }).filter(Boolean);
    } else if (typeof stepWhenVal === 'string' && stepWhenVal.trim()) {
      // Convert single ID to object
      const componentOption = this.formBuilderService.getAllComponentKeyValues().find(opt => opt.id === stepWhenVal);
      this.stepConditionalWhen = componentOption ? [componentOption] : [];
    } else {
      this.stepConditionalWhen = [];
    }
    this.stepConditionalEq = step.properties?.conditional?.eq || '';

    // Load available component keys for conditional logic
    this.loadAvailableComponentKeys();
    this.loadAvailableComponentKeysValues();
    this.loadStepConditionalWhenComponentOptions();
  }

  private resetStepForm(): void {
    this.stepTitle = '';
    this.stepDisabled = false;
    this.stepInvisible = false;
    this.stepConditionalShow = 'true';
    this.stepConditionalWhen = [];
    this.stepConditionalEq = '';
    this.stepConditionalWhenComponentOptions = [];
  }

  addOption(): void {
    if (!this.newOptionLabel.trim()) return;
    
    const newOption: SelectOption = {
      label: this.newOptionLabel.trim(),
      value: this.newOptionValue.trim() || this.formBuilderService.generateUniqueKeyVALUE_PAR(this.newOptionLabel.trim()),
      selected: false
    };

    this.options.push(newOption);
    this.updateProperty('properties.options', [...this.options]);
    
    this.newOptionLabel = '';
    this.newOptionValue = '';
  }

  removeOption(index: number): void {
    this.options.splice(index, 1);
    this.updateProperty('properties.options', [...this.options]);
  }

  moveOption(index: number, direction: 'up' | 'down'): void {
    if (direction === 'up' && index > 0) {
      [this.options[index], this.options[index - 1]] = [this.options[index - 1], this.options[index]];
    } else if (direction === 'down' && index < this.options.length - 1) {
      [this.options[index], this.options[index + 1]] = [this.options[index + 1], this.options[index]];
    }
    this.updateProperty('properties.options', [...this.options]);
  }

  updateOption(index: number, field: 'label' | 'value', value: string): void {
    this.options[index][field] = value;
    this.updateProperty('properties.options', [...this.options]);
  }

  onOptionLabelChange(event: Event, index: number): void {
    const value = (event.target as HTMLInputElement)?.value || '';
    this.updateOption(index, 'label', value);
    const newValue = this.formBuilderService.generateUniqueKeyVALUE_PAR(value);
    this.updateOption(index, 'value', newValue);
  }

  onOptionValueChange(event: Event, index: number): void {
    const value = (event.target as HTMLInputElement)?.value || '';
    const newValue = this.formBuilderService.generateUniqueKeyVALUE_PAR(value);
    this.updateOption(index, 'value', newValue);
  }

  // CKEditor specific methods
  onCkEditorHeightChange(): void {
    this.updateCkEditorConfig();
  }

  onCkEditorLanguageChange(): void {
    this.updateCkEditorConfig();
  }

  onCkEditorToolbarChange(): void {
    // Parse toolbar string back to array
    this.ckEditorToolbar = this.ckEditorToolbarString.split(',').map(item => item.trim());
    this.updateCkEditorConfig();
  }

  private updateCkEditorConfig(): void {
    const ckEditorConfig = {
      toolbar: this.ckEditorToolbar,
      height: this.ckEditorHeight,
      language: this.ckEditorLanguage
    };
    this.updateProperty('properties.ckEditorConfig', ckEditorConfig);
  }

  // API Select specific methods
  onApiUrlChange(): void {
    this.updateApiConfig();
  }

  onApiMethodChange(): void {
    this.updateApiConfig();
  }

  onApiTokenChange(): void {
    this.updateApiConfig();
  }

  onApiLabelFieldChange(): void {
    this.updateApiConfig();
  }

  onApiValueFieldChange(): void {
    this.updateApiConfig();
  }

  onApiHeadersChange(): void {
    this.updateApiConfig();
  }

  onApiRequestBodyChange(): void {
    this.updateApiConfig();
  }

  onApiCacheChange(): void {
    this.updateApiConfig();
  }

  onApiCacheTimeoutChange(): void {
    this.updateApiConfig();
  }

  private updateApiConfig(): void {
    let headers = {};
    let requestBody = {};

    // Parse headers JSON
    if (this.apiHeaders.trim()) {
      try {
        headers = JSON.parse(this.apiHeaders);
      } catch (e) {
        console.warn('Invalid JSON in API headers:', e);
        headers = {};
      }
    }

    // Parse request body JSON
    if (this.apiRequestBody.trim()) {
      try {
        requestBody = JSON.parse(this.apiRequestBody);
      } catch (e) {
        console.warn('Invalid JSON in API request body:', e);
        requestBody = {};
      }
    }

    const apiConfig = {
      url: this.apiUrl.trim(),
      method: this.apiMethod,
      headers: headers,
      token: this.apiToken.trim(),
      labelField: this.apiLabelField.trim() || 'name',
      valueField: this.apiValueField.trim() || 'id',
      requestBody: Object.keys(requestBody).length > 0 ? requestBody : undefined,
      cache: this.apiCache,
      cacheTimeout: this.apiCacheTimeout
    };

    this.updateProperty('properties.apiConfig', apiConfig);
  }

  isInputType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.INPUT ||
           this.state.selectedComponent?.type === ComponentType.EMAIL ||
           this.state.selectedComponent?.type === ComponentType.PASSWORD ||
           this.state.selectedComponent?.type === ComponentType.URL ||
           this.state.selectedComponent?.type === ComponentType.TEL;
  }

  isTextareaType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.TEXTAREA;
  }

  isSelectType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.SELECT;
  }

  isRadioType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.RADIO;
  }

  isSelectBoxType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.SELECT_BOX;
  }

  isSelectApiType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.SELECT_API;
  }

  isFileType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.FILE;
  }

  isNumberType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.NUMBER;
  }

  hasOptions(): boolean {
    return this.isSelectType() || this.isRadioType() || this.isSelectBoxType() || this.isSelectApiType();
  }

  canHaveMultiple(): boolean {
    return this.isSelectType() || this.isFileType() || this.isSelectBoxType() || this.isSelectApiType();
  }

  canHavePattern(): boolean {
    return this.isInputType() || this.isTextareaType();
  }

  canHaveMinMax(): boolean {
    return this.isNumberType() || this.state.selectedComponent?.type === ComponentType.DATE;
  }

  canHaveMinMaxLength(): boolean {
    return this.isInputType() || this.isTextareaType();
  }

  canHavePrefix(): boolean {
    return this.isInputType() || this.isTextareaType() || this.isNumberType();
  }

  canHaveMask(): boolean {
    return this.isInputType() || this.isNumberType();
  }

  canHaveLayoutHorizontal(): boolean {
    return this.isSelectType() || this.isRadioType() || this.isSelectBoxType() || this.isSelectApiType() || this.state.selectedComponent?.type === ComponentType.CHECKBOX;
  }

  isPanelComponent(): boolean {
    return this.state.selectedComponent?.type === ComponentType.PANEL;
  }

  isCheckboxType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.CHECKBOX;
  }

  isRichTextType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.RICH_TEXT;
  }

  isTextHelpType(): boolean {
    return this.state.selectedComponent?.type === ComponentType.TEXT_HELP;
  }

  clearConditionalLogic(): void {
    this.conditionalShow = 'true';
    this.conditionalWhen = [];
    this.conditionalEq = '';
    this.updateProperty('properties.conditional', undefined);
  }

  // Step property update methods
  updateStepProperty(propertyPath: string, value: any): void {
    if (!this.state.selectedStep) return;

    const currentProperties = this.state.selectedStep.properties || {};
    const updates: any = {};

    switch (propertyPath) {
      case 'title':
        updates.properties = { ...currentProperties, title: value };
        // Also update the step's main title
        updates.title = value;
        break;
      case 'disabled':
        updates.properties = { ...currentProperties, disabled: value };
        break;
      case 'invisible':
        updates.properties = { ...currentProperties, invisible: value };
        break;
      case 'conditional':
        updates.properties = { ...currentProperties, conditional: value };
        break;
    }

    this.formBuilderService.updateStep(this.state.selectedStep.id, updates);
  }

  onStepTitleChange(): void {
    this.updateStepProperty('title', this.stepTitle);
  }

  onStepDisabledChange(): void {
    this.updateStepProperty('disabled', this.stepDisabled);
  }

  onStepInvisibleChange(): void {
    this.updateStepProperty('invisible', this.stepInvisible);
  }

  onStepConditionalShowChange(): void {
    this.updateStepConditionalLogic();
  }

  onStepConditionalWhenChange(): void {
    this.loadStepConditionalWhenComponentOptions();
    this.updateStepConditionalLogic();
  }

  onStepConditionalEqChange(): void {
    this.updateStepConditionalLogic();
  }

  private updateStepConditionalLogic(): void {
    // Build normalized array from local field
    let stepWhenArray: string[] = [];

    if (Array.isArray(this.stepConditionalWhen)) {
      // Handle array case - extract IDs from objects or use strings directly
      stepWhenArray = this.stepConditionalWhen.map(item => {
        if (typeof item === 'object' && item !== null && item.id) {
          return item.id.toString().trim();
        }
        return (item || '').toString().trim();
      }).filter(Boolean);
    } else if (typeof this.stepConditionalWhen === 'object' && this.stepConditionalWhen !== null) {
      // Handle single object case from ngx-select-dropdown
      if (this.stepConditionalWhen.id) {
        stepWhenArray = [this.stepConditionalWhen.id.toString().trim()];
      }
    } else if (typeof this.stepConditionalWhen === 'string' && this.stepConditionalWhen.trim()) {
      // Handle string case
      stepWhenArray = this.stepConditionalWhen.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Only save conditional logic if stepWhenArray has items
    if (stepWhenArray.length > 0) {
      const conditional = {
        show: this.stepConditionalShow,
        when: stepWhenArray,
        eq: this.stepConditionalEq
      };
      this.updateStepProperty('conditional', conditional);
    } else {
      // Remove conditional logic if 'when' field is empty
      this.updateStepProperty('conditional', undefined);
    }
  }

  clearStepConditionalLogic(): void {
    this.stepConditionalShow = 'true';
    this.stepConditionalWhen = [];
    this.stepConditionalEq = '';
    this.updateStepProperty('conditional', undefined);
  }

  isStepSelected(): boolean {
    return this.state.selectedStep !== null;
  }

  onAllowsConfidentialityChange(): void {
    this.updateProperty('properties.allowsConfidentiality', this.allowsConfidentiality);
  }

  // Text Help specific change handlers
  onHelpTextChange(): void {
    this.updateProperty('properties.help', this.helpText);
  }

  onOnlyInternalChange(): void {
    this.updateProperty('properties.onlyInternal', this.onlyInternal);
  }

  openHelpTextModal(): void {
    if (this.ckEditorModal) {
      this.ckEditorModal.open(this.helpText, (newContent: string) => {
        this.helpText = newContent;
        this.onHelpTextChange();

        // Forçar detecção de mudanças
        this.cdr.detectChanges();
      });
    } else {
      // Tentar novamente após um pequeno delay
      setTimeout(() => {
        if (this.ckEditorModal) {
          this.openHelpTextModal();
        }
      }, 100);
    }
  }

  canHaveConfidentiality(): boolean {
    return this.isInputType() || this.isTextareaType() || this.isRichTextType();
  }

  canHaveRequired(): boolean {
    return this.isInputType() ||
           this.isTextareaType() ||
           this.isSelectType() ||
           this.isRadioType() ||
           this.isSelectBoxType() ||
           this.isSelectApiType() ||
           this.isCheckboxType() ||
           this.isFileType() ||
           this.isNumberType() ||
           this.isRichTextType() ||
           this.state.selectedComponent?.type === ComponentType.DATE;
  }

  // Method to load options from the selected conditional when component
  private loadConditionalWhenComponentOptions(): void {
    this.conditionalWhenComponentOptions = [];

    // Get the selected component ID from conditionalWhen
    let selectedComponentId: string | null = null;

    if (Array.isArray(this.conditionalWhen) && this.conditionalWhen.length > 0) {
      const firstItem = this.conditionalWhen[0];
      if (typeof firstItem === 'object' && firstItem !== null && firstItem.id) {
        selectedComponentId = firstItem.id;
      }
    } else if (typeof this.conditionalWhen === 'object' && this.conditionalWhen !== null && !Array.isArray(this.conditionalWhen) && 'id' in this.conditionalWhen) {
      selectedComponentId = (this.conditionalWhen as {id: string, name: string}).id;
    }

    if (!selectedComponentId) {
      return;
    }

    // Find the component by ID
    const component = this.findComponentByIdInAllSteps(selectedComponentId);
    if (!component) {
      return;
    }

    // Check if component has options
    if (this.componentHasOptions(component) && component.properties.options) {
      this.conditionalWhenComponentOptions = [...component.properties.options];
    }
  }

  // Method to check if a component has options
  private componentHasOptions(component: FormComponent): boolean {
    return component.type === ComponentType.SELECT ||
           component.type === ComponentType.RADIO ||
           component.type === ComponentType.SELECT_BOX ||
           component.type === ComponentType.SELECT_API;
  }

  // Method to check if the selected conditional when component has options
  hasConditionalWhenComponentOptions(): boolean {
    return this.conditionalWhenComponentOptions.length > 0;
  }

  // Helper method to find component by ID in all steps
  private findComponentByIdInAllSteps(componentId: string): FormComponent | null {
    const state = this.formBuilderService.getCurrentState();
    for (const step of state.formSchema.steps) {
      const found = this.findComponentInArray(componentId, step.components);
      if (found) {
        return found;
      }
    }
    return null;
  }

  // Helper method to find component by ID recursively
  private findComponentInArray(componentId: string, components: FormComponent[]): FormComponent | null {
    for (const component of components) {
      if (component.id === componentId) {
        return component;
      }
      if (component.children) {
        const found = this.findComponentInArray(componentId, component.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Method to load options from the selected step conditional when component
  private loadStepConditionalWhenComponentOptions(): void {
    this.stepConditionalWhenComponentOptions = [];

    // Get the selected component ID from stepConditionalWhen
    let selectedComponentId: string | null = null;

    if (Array.isArray(this.stepConditionalWhen) && this.stepConditionalWhen.length > 0) {
      const firstItem = this.stepConditionalWhen[0];
      if (typeof firstItem === 'object' && firstItem !== null && firstItem.id) {
        selectedComponentId = firstItem.id;
      }
    } else if (typeof this.stepConditionalWhen === 'object' && this.stepConditionalWhen !== null && !Array.isArray(this.stepConditionalWhen) && 'id' in this.stepConditionalWhen) {
      selectedComponentId = (this.stepConditionalWhen as {id: string, name: string}).id;
    }

    if (!selectedComponentId) {
      return;
    }

    // Find the component by ID
    const component = this.findComponentByIdInAllSteps(selectedComponentId);
    if (!component) {
      return;
    }

    // Check if component has options
    if (this.componentHasOptions(component) && component.properties.options) {
      this.stepConditionalWhenComponentOptions = [...component.properties.options];
    }
  }

  // Method to check if the selected step conditional when component has options
  hasStepConditionalWhenComponentOptions(): boolean {
    return this.stepConditionalWhenComponentOptions.length > 0;
  }


}
