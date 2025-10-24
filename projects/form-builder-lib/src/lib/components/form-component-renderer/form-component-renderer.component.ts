import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, OnDestroy, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormComponent, ComponentType, DragDropData, ConditionalLogic, ColumnDefinition, DataGridRow, SelectOption } from '../../models/form-builder.models';
import { FormBuilderService } from '../../services/form-builder.service';
import { ApiSelectService } from '../../services/api-select.service';
import { HelpContentService } from '../../services/help-content.service';
import { ValidationService } from '../../services/validation.service';
import { CustomCKEditorComponent } from '../custom-ckeditor/custom-ckeditor.component';
import { CustomCKEditorService } from '../../services/custom-ckeditor.service';

declare var bootstrap: any;

@Component({
  selector: 'app-form-component-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomCKEditorComponent],
  templateUrl: './form-component-renderer.component.html',
  styleUrls: ['./form-component-renderer.component.scss']
})
export class FormComponentRendererComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() component!: FormComponent;
  @Input() previewMode: boolean = false;
  @Input() selected: boolean = false;
  @Input() showToolbar: boolean = false;
  @Input() hovered: boolean = false;
  @Input() showValidationError: boolean = false;
  @Input() validationErrorMessage: string = '';

  @Output() openProperties = new EventEmitter<void>();
  @Output() deleteComponent = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<any>();

  ComponentType = ComponentType;
  value: any = '';
  dragOverContainer: boolean = false;
  dragOverColumn: number = -1;
  isVisible: boolean = true;
  panelCollapsed: boolean = false;
  draggedRowIndex: number = -1;
  hoveredChildId: string | null = null;
  isHovered: boolean = false;

  // Custom CKEditor
  private ckEditorInstance: any;
  private ckEditorId: string = '';

  // API Select specific properties
  apiOptions: SelectOption[] = [];
  apiLoading: boolean = false;
  apiError: string | null = null;

  // Subscription management
  private stateSub?: Subscription;

  constructor(
    private formBuilderService: FormBuilderService,
    private apiSelectService: ApiSelectService,
    private helpContentService: HelpContentService,
    private validationService: ValidationService,
    private elementRef: ElementRef,
    private customCKEditorService: CustomCKEditorService
  ) {}

  ngOnInit(): void {
    this.value = this.component.value || this.getDefaultValue();

    // Generate unique CKEditor ID for rich text components
    if (this.isRichTextType()) {
      this.ckEditorId = this.customCKEditorService.generateUniqueId(`ckeditor_${this.component.id}`);
    }

    // Sincronizar valor com opções selecionadas para select e radio
    this.syncValueWithOptions();

    this.evaluateConditionalLogic();
    this.initializePanelState();

    // Initialize DataGrid specific features
    this.initializeDataGrid();

    // Load API options if this is a SELECT_API component
    if (this.isSelectApiType()) {
      this.loadApiOptions();
    }

    // Subscribe to form state changes to re-evaluate conditional logic and sync values
    this.stateSub = this.formBuilderService.state$.subscribe(state => {
      // Find the current component in the updated state and sync local value
      const updatedComponent = this.findComponentInState(state, this.component.id);
      if (updatedComponent && updatedComponent.value !== this.value) {
        this.value = updatedComponent.value !== undefined && updatedComponent.value !== null
          ? updatedComponent.value
          : this.getDefaultValue();

        // Re-sync options after value update
        this.syncValueWithOptions();

        // For SELECT_API, ensure options are loaded if needed
        if (this.isSelectApiType() && (!this.apiOptions || this.apiOptions.length === 0)) {
          const hasApiConfig = !!updatedComponent.properties?.apiConfig;
          if (hasApiConfig) {
            this.loadApiOptions();
          }
        }
      }

      this.evaluateConditionalLogic();
    });
  }

  ngOnDestroy(): void {
    this.stateSub?.unsubscribe();

    // CKEditor cleanup is handled inside app-custom-ckeditor; avoid double destroy here
  }

  private initializeDataGrid(): void {
    if (!this.isDataGridType()) return;

    // Ensure rows array exists
    if (!this.component.rows) {
      this.component.rows = [];
    }

    // Ensure value is synchronized with rows
    if (this.component.rows.length > 0 && !this.component.value) {
      this.component.value = this.component.rows.map(row => row.data);
    } else if (!this.component.value) {
      this.component.value = [];
    }

    console.log('DataGrid initialized:', {
      componentId: this.component.id,
      key: this.component.key,
      rowsCount: this.component.rows.length,
      valueLength: this.component.value?.length || 0,
      previewMode: this.previewMode
    });
  }

  // Debug method to test data export
  debugDataGridExport(): void {
    if (!this.isDataGridType()) return;

    console.log('=== DataGrid Debug Export ===');
    console.log('Component ID:', this.component.id);
    console.log('Component Key:', this.component.key);
    console.log('Preview Mode:', this.previewMode);
    console.log('Rows Count:', this.component.rows?.length || 0);
    console.log('Rows Data:', this.component.rows);
    console.log('Component Value:', this.component.value);

    // Test export functionality with debug
    try {
      console.log('=== Testing Export Functionality ===');
      const debugResult = this.formBuilderService.debugExportFormData();
      console.log('DataGrid in exported data:', debugResult.data[this.component.key]);

      // Also test regular export
      const normalExport = this.formBuilderService.exportFormData();
      const normalParsed = JSON.parse(normalExport);
      console.log('Normal export DataGrid data:', normalParsed[this.component.key]);

      // Compare results
      console.log('Results match:', JSON.stringify(debugResult.data[this.component.key]) === JSON.stringify(normalParsed[this.component.key]));
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    console.log('=== End DataGrid Debug ===');
  }

  // Debug method to test validation
  debugDataGridValidation(): void {
    if (!this.isDataGridType()) return;

    console.log('=== DataGrid Debug Validation ===');
    console.log('Component ID:', this.component.id);
    console.log('Component Key:', this.component.key);
    console.log('Component Label:', this.component.label);
    console.log('Component Required:', this.component.required);
    console.log('Preview Mode:', this.previewMode);
    console.log('Rows Count:', this.component.rows?.length || 0);
    console.log('Children Count:', this.component.children?.length || 0);

    if (this.component.children) {
      console.log('Child Components:');
      this.component.children.forEach((child, index) => {
        console.log(`  Child ${index + 1}:`, {
          id: child.id,
          key: child.key,
          label: child.label,
          type: child.type,
          required: child.required
        });
      });
    }

    if (this.component.rows) {
      console.log('Rows Data:');
      this.component.rows.forEach((row, index) => {
        console.log(`  Row ${index + 1}:`, {
          id: row.id,
          index: row.index,
          data: row.data
        });
      });
    }

    // Test validation using the current state
    const state = this.formBuilderService.getCurrentState();
    const currentStep = state.formSchema.steps.find(s => s.id === state.currentStep);
    if (currentStep) {
      this.validationService.debugValidationForStep(currentStep, this.formBuilderService);
    }

    console.log('=== End DataGrid Validation Debug ===');
  }

  private findComponentInState(state: any, componentId: string): FormComponent | null {
    if (!state?.formSchema?.steps) return null;

    for (const step of state.formSchema.steps) {
      const found = this.findComponentInArray(componentId, step.components);
      if (found) return found;
    }
    return null;
  }

  private findComponentInArray(componentId: string, components: FormComponent[]): FormComponent | null {
    for (const component of components) {
      if (component.id === componentId) return component;
      if (component.children) {
        const found = this.findComponentInArray(componentId, component.children);
        if (found) return found;
      }
    }
    return null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['component']) {
      // Update local value from the updated component input (important for import)
      this.value = this.component.value !== undefined && this.component.value !== null
        ? this.component.value
        : this.getDefaultValue();

      // If this is an API select, ensure options are loaded so we can sync selection
      if (this.isSelectApiType()) {
        const hasApiConfig = !!this.component.properties?.apiConfig;
        const shouldLoad = hasApiConfig && (!this.apiOptions || this.apiOptions.length === 0);
        if (shouldLoad) {
          this.loadApiOptions();
        } else {
          // If options already exist, simply sync the selection
          this.syncValueWithOptions();
        }
      } else {
        // Non-API components rely on properties.options, so just sync
        this.syncValueWithOptions();
      }

      this.initializePanelState();
      this.evaluateConditionalLogic();

      // Reinicializar tooltips se for Text Help
      if (this.isTextHelpType()) {
        setTimeout(() => this.initializeTooltips(), 100);
      }
    }
  }

  // Método para sincronizar valor do componente com opções selecionadas
  private syncValueWithOptions(): void {
    if (this.component.type === ComponentType.SELECT ||
        this.component.type === ComponentType.RADIO ||
        this.component.type === ComponentType.SELECT_BOX ||
        this.component.type === ComponentType.SELECT_API) {

      if (this.component.properties.options && this.value !== undefined && this.value !== null && this.value !== '') {
        // Para select e radio com valor único
        if (this.component.type === ComponentType.SELECT || this.component.type === ComponentType.RADIO) {
          this.component.properties.options.forEach(option => {
            option.selected = option.value == this.value;
          });
        }
        // Para select box com múltipla seleção
        else if (this.component.type === ComponentType.SELECT_BOX && this.component.properties.multiple) {
          const selectedValues = Array.isArray(this.value) ? this.value : [this.value];
          this.component.properties.options.forEach(option => {
            option.selected = selectedValues.some(val => val == option.value);
          });
        }
        // Para select box com seleção única
        else if (this.component.type === ComponentType.SELECT_BOX && !this.component.properties.multiple) {
          this.component.properties.options.forEach(option => {
            option.selected = option.value == this.value;
          });
        }
        // Para SELECT_API components
        else if (this.component.type === ComponentType.SELECT_API) {
          if (this.component.properties.multiple) {
            const selectedValues = Array.isArray(this.value) ? this.value : [this.value];
            this.component.properties.options.forEach(option => {
              option.selected = selectedValues.some(val => this.compareValues(val, option));
            });
          } else {
            this.component.properties.options.forEach(option => {
              option.selected = this.compareValues(this.value, option);
            });
          }
        }
      }

      // Sync apiOptions as well for SELECT_API components
      if (this.component.type === ComponentType.SELECT_API && this.apiOptions.length > 0) {
        if (this.value !== undefined && this.value !== null && this.value !== '') {
          if (this.component.properties.multiple) {
            const selectedValues = Array.isArray(this.value) ? this.value : [this.value];
            this.apiOptions.forEach(option => {
              option.selected = selectedValues.some(val => this.compareValues(val, option));
            });
          } else {
            this.apiOptions.forEach(option => {
              option.selected = this.compareValues(this.value, option);
            });
          }
        } else {
          this.apiOptions.forEach(option => {
            option.selected = false;
          });
        }
      }
    }
  }

  private initializePanelState(): void {
    // Initialize panel collapsed state, but preserve user-toggled state across updates
    if (this.component.type === ComponentType.PANEL && this.component.properties.collapsible) {
      if (typeof (this.component.properties as any).panelCollapsed === 'boolean') {
        this.panelCollapsed = (this.component.properties as any).panelCollapsed;
      } else {
        this.panelCollapsed = this.component.properties.initCollapsed || false;
        (this.component.properties as any).panelCollapsed = this.panelCollapsed;
      }
    } else {
      this.panelCollapsed = false;
    }
  }

  ngAfterViewInit(): void {
    this.initializeTooltips();
  }

  private initializeTooltips(): void {
    // Initialize Bootstrap tooltips
    setTimeout(() => {
      const tooltipTriggerList = this.elementRef.nativeElement.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach((tooltipTriggerEl: any) => {
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
          // Dispose existing tooltip if any
          const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
          if (existingTooltip) {
            existingTooltip.dispose();
          }
          // Create new tooltip
          new bootstrap.Tooltip(tooltipTriggerEl, {
            html: true,
            placement: 'top',
            trigger: 'hover'
          });
        }
      });
    }, 100);
  }

  getDefaultValue(): any {
    switch (this.component.type) {
      case ComponentType.CHECKBOX:
        return false;
      case ComponentType.RADIO:
        return '';
      case ComponentType.SELECT:
        return '';
      case ComponentType.SELECT_BOX:
        return this.component.properties.multiple ? [] : '';
      case ComponentType.SELECT_API:
        return this.component.properties.multiple ? [] : '';
      default:
        return '';
    }
  }

  onValueChange(value: any): void {
    this.value = value;

    // MUDANÇA: Apenas gravar dados no componente quando estiver no preview mode
    if (this.previewMode) {
      this.component.value = value;

      // Emitir evento para componentes pais (especialmente DataGrid)
      this.valueChange.emit(value);

      // Sincronizar opções quando o valor mudar (apenas no preview)
      this.syncValueWithOptions();

      // Trigger re-evaluation of conditional logic and recursive validation
      // when any field value changes (apenas no preview)
      setTimeout(() => {
        this.formBuilderService.triggerConditionalLogicUpdate();
        // Trigger recursive validation for this component and its parents
        this.formBuilderService.updateComponentAndParentsValidation(this.component.id);
      }, 0);
    } else {
      // No builder mode, apenas atualizar valor local sem persistir
      // Isso permite visualizar o que seria digitado sem gravar
      console.log('Builder mode: valor não persistido para', this.component.key, ':', value);
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target?.value || '';

    // Apply mask if defined
    if (this.component.properties.mask && (this.component.type === ComponentType.INPUT || this.component.type === ComponentType.NUMBER)) {
      value = this.applyMask(value, this.component.properties.mask);
      target.value = value;
    }

    this.onValueChange(value);
  }

  private applyMask(value: string, mask: string): string {
    if (!mask || !value) return value;

    // Remove all characters that are not allowed based on mask
    let cleanInput = '';

    // Determine what characters to keep based on mask pattern
    const hasNumbers = /[09]/.test(mask);
    const hasLetters = /[A]/.test(mask);

    if (hasNumbers && !hasLetters) {
      // Only numbers allowed
      cleanInput = value.replace(/\D/g, '');
    } else if (hasLetters && !hasNumbers) {
      // Only letters allowed
      cleanInput = value.replace(/[^A-Za-z]/g, '');
    } else {
      // Mixed: keep alphanumeric
      cleanInput = value.replace(/[^A-Za-z0-9]/g, '');
    }

    let maskedValue = '';
    let inputIndex = 0;

    for (let i = 0; i < mask.length && inputIndex < cleanInput.length; i++) {
      const maskChar = mask[i];

      if (maskChar === '0' || maskChar === '9') {
        // Placeholder for number
        if (/\d/.test(cleanInput[inputIndex])) {
          maskedValue += cleanInput[inputIndex];
          inputIndex++;
        } else {
          break; // Stop if current input char is not a number
        }
      } else if (maskChar === 'A') {
        // Placeholder for letter
        if (/[A-Za-z]/.test(cleanInput[inputIndex])) {
          maskedValue += cleanInput[inputIndex].toUpperCase();
          inputIndex++;
        } else {
          break; // Stop if current input char is not a letter
        }
      } else if (maskChar === 'a') {
        // Placeholder for letter (lowercase)
        if (/[A-Za-z]/.test(cleanInput[inputIndex])) {
          maskedValue += cleanInput[inputIndex].toLowerCase();
          inputIndex++;
        } else {
          break; // Stop if current input char is not a letter
        }
      } else {
        // Static character (like -, (, ), space, etc.)
        maskedValue += maskChar;
      }
    }

    return maskedValue;
  }

  onTextareaChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.onValueChange(target?.value || '');
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;

    if (this.component.properties.multiple) {
      // Handle multiple selection - get all selected options
      const selectedOptions = Array.from(target.selectedOptions);
      const selectedValues = selectedOptions.map(option => {
        if (this.isSelectApiType()) {
          // For SELECT_API, find and return the full object
          const apiOption = this.apiOptions.find(opt => opt.value == option.value);
          return apiOption ? this.getFullObjectFromOption(apiOption) : option.value;
        } else {
          return option.value;
        }
      });
      this.onValueChange(selectedValues);
    } else {
      // Handle single selection
      if (this.isSelectApiType()) {
        // For SELECT_API, find and return the full object
        const apiOption = this.apiOptions.find(opt => opt.value == target.value);
        this.onValueChange(apiOption ? this.getFullObjectFromOption(apiOption) : (target?.value || ''));
      } else {
        this.onValueChange(target?.value || '');
      }
    }
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onValueChange(target?.checked || false);
  }

  onCheckboxOptionChange(event: Event, option: any): void {
    const target = event.target as HTMLInputElement;
    option.selected = target?.checked || false;

    // Update the component's options
    if (this.component.properties.options) {
      const index = this.component.properties.options.findIndex(opt => opt.value === option.value);
      if (index !== -1) {
        this.component.properties.options[index].selected = option.selected;
      }
    }
  }

  onSelectBoxOptionChange(event: Event, option: any): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target?.checked || false;

    if (this.component.properties.multiple) {
      // Multiple selection mode
      let currentValue = Array.isArray(this.value) ? [...this.value] : [];

      if (isChecked) {
        // Add value if checked and not already present
        const valueToAdd = this.isSelectApiType() ? this.getFullObjectFromOption(option) : option.value;
        const alreadyExists = this.isSelectApiType()
          ? currentValue.some(val => this.compareValues(val, valueToAdd))
          : currentValue.includes(option.value);

        if (!alreadyExists) {
          currentValue.push(valueToAdd);
        }
      } else {
        // Remove value if unchecked
        if (this.isSelectApiType()) {
          currentValue = currentValue.filter(val => !this.compareValues(val, this.getFullObjectFromOption(option)));
        } else {
          currentValue = currentValue.filter(val => val !== option.value);
        }
      }

      this.onValueChange(currentValue);

      // Update option selection state
      option.selected = isChecked;
    } else {
      // Single selection mode
      if (isChecked) {
        // Uncheck all other options
        if (this.component.properties.options) {
          this.component.properties.options.forEach(opt => {
            opt.selected = opt.value === option.value;
          });
        }
        const valueToSet = this.isSelectApiType() ? this.getFullObjectFromOption(option) : option.value;
        this.onValueChange(valueToSet);
      } else {
        // If unchecking the current selection, clear value
        this.onValueChange('');
        option.selected = false;
      }
    }

    // Update the component's options based on component type
    if (this.isSelectApiType()) {
      // For API Select, update apiOptions
      const apiIndex = this.apiOptions.findIndex(opt => opt.value === option.value);
      if (apiIndex !== -1) {
        this.apiOptions[apiIndex].selected = option.selected;
      }
      // Also update component properties for consistency
      if (this.component.properties.options) {
        const propIndex = this.component.properties.options.findIndex(opt => opt.value === option.value);
        if (propIndex !== -1) {
          this.component.properties.options[propIndex].selected = option.selected;
        }
      }
    } else {
      // For regular Select, update component.properties.options
      if (this.component.properties.options) {
        const index = this.component.properties.options.findIndex(opt => opt.value === option.value);
        if (index !== -1) {
          this.component.properties.options[index].selected = option.selected;
        }
      }
    }
  }

  getInputType(): string {
    switch (this.component.type) {
      case ComponentType.EMAIL:
        return 'email';
      case ComponentType.PASSWORD:
        return 'password';
      case ComponentType.NUMBER:
        return 'number';
      case ComponentType.DATE:
        return 'date';
      case ComponentType.URL:
        return 'url';
      case ComponentType.TEL:
        return 'tel';
      case ComponentType.FILE:
        return 'file';
      default:
        return 'text';
    }
  }

  getComponentClasses(): string {
    let classes = 'form-component-rendered';

    if (this.component.properties.classes) {
      classes += ' ' + this.component.properties.classes.join(' ');
    }

    if (this.selected && !this.previewMode) {
      classes += ' selected';
    }

    if (this.hovered && !this.previewMode) {
      classes += ' hovered';
    }

    if (!this.previewMode) {
      classes += ' design-mode';
    }

    return classes;
  }

  getFormControlClasses(): string {
    let classes = 'form-control';
    
    if (this.component.type === ComponentType.TEXTAREA) {
      classes = 'form-control';
    } else if (this.component.type === ComponentType.SELECT) {
      classes = 'form-select';
    } else if (this.component.type === ComponentType.CHECKBOX || this.component.type === ComponentType.RADIO) {
      classes = 'form-check-input';
    } else if (this.component.type === ComponentType.FILE) {
      classes = 'form-control';
    }
    
    return classes;
  }

  getLabelClasses(): string {
    let classes = '';
    
    if (this.component.type === ComponentType.CHECKBOX || this.component.type === ComponentType.RADIO) {
      classes = 'form-label';
    } else {
      classes = 'form-label';
    }
    
    if (this.component.required) {
      classes += ' required';
    }
    
    return classes;
  }

  getContainerClasses(): string {
    let classes = '';
    
    if (this.component.type === ComponentType.CHECKBOX || this.component.type === ComponentType.RADIO) {
      classes = 'form-check';
    } else if (this.component.type === ComponentType.PANEL) {
      classes = 'card';
    } else {
      classes = 'mb-3';
    }
    
    return classes;
  }

  isInputType(): boolean {
    return [
      ComponentType.INPUT,
      ComponentType.EMAIL,
      ComponentType.PASSWORD,
      ComponentType.NUMBER,
      ComponentType.DATE,
      ComponentType.URL,
      ComponentType.TEL,
      ComponentType.FILE
    ].includes(this.component.type);
  }

  isSelectType(): boolean {
    return this.component.type === ComponentType.SELECT;
  }

  isTextareaType(): boolean {
    return this.component.type === ComponentType.TEXTAREA;
  }

  isCheckboxType(): boolean {
    return this.component.type === ComponentType.CHECKBOX;
  }

  isRadioType(): boolean {
    return this.component.type === ComponentType.RADIO;
  }

  isSelectBoxType(): boolean {
    return this.component.type === ComponentType.SELECT_BOX;
  }

  isSelectApiType(): boolean {
    return this.component.type === ComponentType.SELECT_API;
  }


  isPanelType(): boolean {
    return this.component.type === ComponentType.PANEL;
  }

  isColumnsType(): boolean {
    return this.component.type === ComponentType.COLUMNS;
  }

  isDataGridType(): boolean {
    return this.component.type === ComponentType.DATAGRID;
  }

  isRichTextType(): boolean {
    return this.component.type === ComponentType.RICH_TEXT;
  }

  isTextHelpType(): boolean {
    return this.component.type === ComponentType.TEXT_HELP;
  }

  getTextHelpLabelClasses(): string {
    let classes = 'text-help-label fw-bold';

    if (this.component.properties.onlyInternal) {
      classes += ' text-warning'; // Amarelo claro
    } else {
      classes += ' text-primary'; // Azul claro
    }

    return classes;
  }

  getTextHelpTooltip(): string {
    if (this.component.properties?.help) {
      // Remover tags HTML e limitar o tamanho do tooltip
      const textContent = this.component.properties.help
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim();

      // Limitar a 200 caracteres
      if (textContent.length > 200) {
        return textContent.substring(0, 200) + '...';
      }
      return textContent;
    }
    return '';
  }

  onTextHelpClick(): void {
    if (this.component.properties?.help) {
      const title = this.component.label || 'Text Help';
      this.helpContentService.showHelpContent(
        title,
        this.component.properties.help,
        this.component.id
      );
    }
  }


  hasOptions(): boolean {
    if (this.isSelectApiType()) {
      return this.apiOptions.length > 0;
    }
    return Boolean(this.component.properties.options && this.component.properties.options.length > 0);
  }

  getOptions(): any[] {
    if (this.isSelectApiType()) {
      return this.apiOptions;
    }
    return this.component.properties.options || [];
  }

  getRadioName(): string {
    return `radio_${this.component.id}`;
  }

  getComponentStyle(): any {
    return this.component.properties.styles || {};
  }

  getComponentAttributes(): any {
    const attributes: any = {
      id: this.component.id,
      ...this.component.properties.attributes
    };

    if (this.component.required && this.previewMode) {
      attributes.required = true;
    }

    if (this.component.properties.disabled) {
      attributes.disabled = true;
    }

    if (this.component.properties.readonly) {
      attributes.readonly = true;
    }

    if (this.component.properties.hidden) {
      attributes.hidden = true;
    }

    // Add validation attributes
    if (this.component.properties.minLength) {
      attributes.minlength = this.component.properties.minLength;
    }

    if (this.component.properties.maxLength) {
      attributes.maxlength = this.component.properties.maxLength;
    }

    if (this.component.properties.min !== undefined) {
      attributes.min = this.component.properties.min;
    }

    if (this.component.properties.max !== undefined) {
      attributes.max = this.component.properties.max;
    }

    if (this.component.properties.step !== undefined) {
      attributes.step = this.component.properties.step;
    }

    if (this.component.properties.pattern) {
      attributes.pattern = this.component.properties.pattern;
    }

    if (this.component.properties.accept && this.component.type === ComponentType.FILE) {
      attributes.accept = this.component.properties.accept;
    }

    if (this.component.properties.multiple && 
        (this.component.type === ComponentType.SELECT || this.component.type === ComponentType.FILE)) {
      attributes.multiple = true;
    }

    return attributes;
  }

  getTextareaAttributes(): any {
    const attributes = this.getComponentAttributes();

    if (this.component.properties.rows) {
      attributes.rows = this.component.properties.rows;
    }

    if (this.component.properties.cols) {
      attributes.cols = this.component.properties.cols;
    }

    return attributes;
  }

  trackByOptionValue(index: number, option: any): any {
    return option.value;
  }

  // isSelectBoxOptionSelected(option: any): boolean {
  //   if (this.component.properties.multiple) {
  //     // Multiple selection - check if value is in array
  //     const currentValue = Array.isArray(this.value) ? this.value : [];
  //     return currentValue.includes(option.value);
  //   } else {
  //     // Single selection - check if value matches
  //     return this.value === option.value;
  //   }
  // }

  isValueArray(): boolean {
    return Array.isArray(this.value);
  }

  isSelectBoxOptionSelected(option: any): boolean {
    // Handle SELECT_BOX (Form.io selectboxes) explicitly
    if (this.isSelectBoxType()) {
      // Normalize value: it can be array or object {key: true/false}
      let currentValues: any[] = [];
      if (Array.isArray(this.value)) {
        currentValues = this.value;
      } else if (this.value && typeof this.value === 'object') {
        currentValues = Object.keys(this.value).filter(k => this.value[k] === true || this.value[k] === 'true');
      } else if (this.value !== undefined && this.value !== null && this.value !== '') {
        currentValues = [this.value];
      }
      // Compare by value or label to be tolerant with different exports
      return currentValues.some(val => val == option.value || val == option.label);
    }

    // Fallback for SELECT / SELECT_API usage of this helper
    if ((this.isSelectType() || this.isSelectApiType()) && this.component.properties.multiple) {
      const currentValue = Array.isArray(this.value) ? this.value : [];
      if (this.isSelectApiType()) {
        return currentValue.some(val => this.compareValues(val, option));
      } else {
        return currentValue.some(val => val == option.value);
      }
    } else {
      if (this.isSelectApiType()) {
        return this.compareValues(this.value, option);
      } else {
        return this.value == option.value;
      }
    }
  }

  // Chip management methods for Select with multiple selection
  getSelectedChips(): any[] {
    if ((!this.isSelectType() && !this.isSelectApiType()) || !this.component.properties.multiple) {
      return [];
    }

    const selectedValues = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);

    // Get options based on component type
    let options = [];
    if (this.isSelectApiType()) {
      options = this.apiOptions;
    } else {
      options = this.component.properties.options || [];
    }

    return selectedValues.map(val => {
      if (this.isSelectApiType() && typeof val === 'object' && val !== null) {
        // For SELECT_API with full objects, extract label from object
        const labelField = this.component.properties.apiConfig?.labelField || 'name';
        const valueField = this.component.properties.apiConfig?.valueField || 'id';
        const label = val[labelField] || val.label || val.name || val.title || String(val[valueField] || 'Item');
        const value = val[valueField] || val.value || val.id || val;
        return { value: value, label: String(label) };
      } else {
        // Find the option with matching value using loose comparison
        const option = options.find(opt => this.isSelectApiType() ? this.compareValues(val, opt) : opt.value == val);

        if (option && option.label) {
          return { value: option.value, label: option.label };
        }

        // Fallback: try to find in component.properties.options as backup
        if (this.component.properties.options) {
          const backupOption = this.component.properties.options.find(opt => opt.value == val);
          if (backupOption && backupOption.label) {
            return { value: backupOption.value, label: backupOption.label };
          }
        }

        // Last resort: use the value itself but make it more user-friendly
        const displayValue = val !== null && val !== undefined ? String(val) : 'Item vazio';
        return { value: val, label: displayValue };
      }
    });
  }

  getAvailableOptions(): any[] {
    if ((!this.isSelectType() && !this.isSelectApiType()) || !this.component.properties.multiple) {
      return this.getOptions();
    }

    const selectedValues = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
    return this.getOptions().filter(option => !selectedValues.some(val => val == option.value));
  }

  removeChip(chipValue: any): void {
    if ((!this.isSelectType() && !this.isSelectApiType()) || !this.component.properties.multiple) {
      return;
    }

    let selectedValues = Array.isArray(this.value) ? [...this.value] : (this.value ? [this.value] : []);

    if (this.isSelectApiType()) {
      // For SELECT_API, compare based on the value field
      const valueField = this.component.properties.apiConfig?.valueField || 'id';
      selectedValues = selectedValues.filter(val => {
        if (typeof val === 'object' && val !== null) {
          return (val[valueField] || val.value || val.id) != chipValue;
        }
        return val != chipValue;
      });
    } else {
      // Use loose comparison to handle string/number differences
      selectedValues = selectedValues.filter(val => val != chipValue);
    }

    this.onValueChange(selectedValues);
  }

  onMultiSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;

    if (!selectedValue) {
      return;
    }

    // Reset the dropdown to default
    target.value = '';

    // Add the selected value to the current selection
    let selectedValues = Array.isArray(this.value) ? [...this.value] : (this.value ? [this.value] : []);

    if (!selectedValues.includes(selectedValue)) {
      selectedValues.push(selectedValue);
      this.onValueChange(selectedValues);
    }
  }

  trackByChipValue(index: number, chip: any): any {
    return chip.value;
  }

  hasConditionalLogic(): boolean {
    return !!(this.component.properties.conditional && this.component.properties.conditional.when);
  }

  // API Select methods
  loadApiOptions(): void {
    if (!this.isSelectApiType() || !this.component.properties.apiConfig) {
      return;
    }

    const rawConfig = this.component.properties.apiConfig;

    // Validate required config
    if (!rawConfig.url || !rawConfig.url.trim()) {
      this.apiError = 'URL da API não configurada';
      this.apiOptions = [];
      return;
    }

    // Create a valid ApiSelectConfig with all required fields
    const apiConfig = {
      url: rawConfig.url.trim(),
      method: rawConfig.method || 'GET',
      headers: rawConfig.headers || {},
      token: rawConfig.token || '',
      labelField: rawConfig.labelField || 'name',
      valueField: rawConfig.valueField || 'id',
      requestBody: rawConfig.requestBody,
      cache: rawConfig.cache !== false,
      cacheTimeout: rawConfig.cacheTimeout || 30
    };

    // Set loading state
    this.apiLoading = true;
    this.apiError = null;

    this.apiSelectService.fetchOptions(apiConfig).subscribe({
      next: (options) => {
        this.apiOptions = options;
        this.apiLoading = false;
        this.apiError = null;

        // Update component's options for consistency
        this.component.properties.options = [...options];

        // Sync selected values with loaded options
        this.syncValueWithOptions();
      },
      error: (error) => {
        this.apiLoading = false;
        this.apiError = error.message || 'Erro ao carregar opções da API';
        this.apiOptions = [];
        console.error('API Select Error:', error);
      }
    });
  }

  reloadApiOptions(): void {
    if (!this.isSelectApiType() || !this.component.properties.apiConfig) {
      return;
    }

    const rawConfig = this.component.properties.apiConfig;

    // Validate required config
    if (!rawConfig.url || !rawConfig.url.trim()) {
      return;
    }

    // Create a valid ApiSelectConfig with all required fields
    const apiConfig = {
      url: rawConfig.url.trim(),
      method: rawConfig.method || 'GET',
      headers: rawConfig.headers || {},
      token: rawConfig.token || '',
      labelField: rawConfig.labelField || 'name',
      valueField: rawConfig.valueField || 'id',
      requestBody: rawConfig.requestBody,
      cache: rawConfig.cache !== false,
      cacheTimeout: rawConfig.cacheTimeout || 30
    };

    // Clear cache and reload
    this.apiSelectService.clearCache(apiConfig);
    this.loadApiOptions();
  }

  getApiOptions(): SelectOption[] {
    if (this.isSelectApiType()) {
      return this.apiOptions;
    }
    return this.getOptions();
  }

  hasApiOptions(): boolean {
    return this.isSelectApiType() ? this.apiOptions.length > 0 : this.hasOptions();
  }

  isApiLoading(): boolean {
    return this.isSelectApiType() && this.apiLoading;
  }

  hasApiError(): boolean {
    return this.isSelectApiType() && !!this.apiError;
  }

  getApiError(): string | null {
    return this.isSelectApiType() ? this.apiError : null;
  }

  trackByComponentId(index: number, component: FormComponent): string {
    return component.id;
  }

  onComponentClick(event: Event): void {
    if (!this.previewMode) {
      event.stopPropagation(); // Prevent event bubbling to parent components
      this.formBuilderService.selectComponent(this.component.id);
    }
  }


  // Drag and drop methods for container components
  onContainerDragOver(event: DragEvent): void {
    if (!this.canHaveChildren()) return;

    event.preventDefault();
    event.stopPropagation();
    this.dragOverContainer = true;
    event.dataTransfer!.dropEffect = 'copy';
  }

  onContainerDragLeave(event: DragEvent): void {
    if (!this.canHaveChildren()) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    // Only clear dragOver if mouse is outside the container
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.dragOverContainer = false;
    }
  }

  onContainerDrop(event: DragEvent): void {
    if (!this.canHaveChildren()) return;

    event.preventDefault();
    event.stopPropagation();
    this.dragOverContainer = false;

    try {
      const data = JSON.parse(event.dataTransfer!.getData('application/json')) as DragDropData;

      if (data.componentType) {
        // Dropping from component palette into container
        const newComponent = this.formBuilderService.createComponent(data.componentType, this.component.id);
        this.formBuilderService.addComponent(newComponent, undefined, this.component.id);
      } else if (data.component && data.component.id !== this.component.id) {
        // Moving existing component into container
        this.moveComponentToContainer(data.component);
      }
    } catch (error) {
      console.error('Error handling container drop:', error);
    }
  }

  private moveComponentToContainer(draggedComponent: FormComponent): void {
    // Remove from current parent and add to this container
    this.formBuilderService.removeComponent(draggedComponent.id);
    const newComponent = { ...draggedComponent, parentId: this.component.id };
    this.formBuilderService.addComponent(newComponent, undefined, this.component.id);
  }

  private canHaveChildren(): boolean {
    return (this.isPanelType() || this.isColumnsType() || this.isDataGridType()) && !this.previewMode;
  }

  isChildSelected(childId: string): boolean {
    // Get the current selected component from the service
    const state = this.formBuilderService.getCurrentState();
    return state.selectedComponent?.id === childId;
  }

  isChildHovered(childId: string): boolean {
    return this.hoveredChildId === childId;
  }

  onChildMouseEnter(childId: string): void {
    if (!this.previewMode) {
      this.hoveredChildId = childId;
    }
  }

  onChildMouseLeave(childId: string): void {
    if (!this.previewMode && this.hoveredChildId === childId) {
      this.hoveredChildId = null;
    }
  }

  onComponentMouseEnter(): void {
    if (!this.previewMode) {
      this.isHovered = true;
    }
  }

  onComponentMouseLeave(): void {
    if (!this.previewMode) {
      this.isHovered = false;
    }
  }


  getCKEditorUniqueId(): string {
    return this.ckEditorId;
  }

  getCKEditorConfig(): any {
    const defaultConfig = {
      toolbar: {
        items: [
          'heading', '|',
          'bold', 'italic', 'underline', 'strikethrough', '|',
          'fontSize', 'fontColor', 'fontBackgroundColor', '|',
          'alignment', '|',
          'bulletedList', 'numberedList', 'todoList', '|',
          'outdent', 'indent', '|',
          'link', 'imageUpload', 'insertTable', 'blockQuote', 'codeBlock', '|',
          'horizontalLine', 'specialCharacters', '|',
          'undo', 'redo'
        ]
      },
      language: 'pt-br',
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
      },
      fontSize: {
        options: [9, 11, 13, 'default', 17, 19, 21]
      },
      fontColor: {
        colors: [
          { color: 'hsl(0, 0%, 0%)', label: 'Black' },
          { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
          { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
          { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
          { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
          { color: 'hsl(0, 75%, 60%)', label: 'Red' },
          { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
          { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
          { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
          { color: 'hsl(120, 75%, 60%)', label: 'Green' },
          { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
          { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
          { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
          { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
          { color: 'hsl(270, 75%, 60%)', label: 'Purple' }
        ]
      },
      placeholder: this.component.placeholder || 'Digite seu conteúdo aqui...'
    };

    if (!this.component.properties.ckEditorConfig) {
      return defaultConfig;
    }

    const config = { ...defaultConfig };

    // Apply toolbar configuration
    if (this.component.properties.ckEditorConfig.toolbar) {
      config.toolbar.items = this.component.properties.ckEditorConfig.toolbar;
    }

    // Apply language
    if (this.component.properties.ckEditorConfig.language) {
      config.language = this.component.properties.ckEditorConfig.language;
    }

    // Apply placeholder
    if (this.component.placeholder) {
      config.placeholder = this.component.placeholder;
    }

    // Merge other custom configurations (excluding height which is handled via CSS)
    const { height, ...otherConfigs } = this.component.properties.ckEditorConfig;

    return {
      ...config,
      ...otherConfigs,
      toolbar: config.toolbar // Ensure toolbar structure is preserved
    };
  }

  onCKEditorReady(editor: any): void {
    // Custom CKEditor is ready
    console.log('Custom CKEditor ready for component:', this.component.id, 'with ID:', this.ckEditorId);

    // Store editor reference for potential future use
    this.ckEditorInstance = editor;
  }

  onCKEditorValueChange(newValue: string): void {
    // Update the component value using the standard onValueChange method
    // This ensures consistency with other form elements
    this.onValueChange(newValue);
  }

  onOpenProperties(event: Event): void {
    event.stopPropagation();
    this.openProperties.emit();
  }

  onDeleteComponent(event: Event): void {
    event.stopPropagation();
    this.deleteComponent.emit();
  }

  onChildOpenProperties(childComponent: FormComponent): void {
    this.formBuilderService.selectComponent(childComponent.id);
    this.formBuilderService.openPropertiesTab();
  }

  onChildDeleteComponent(childId: string): void {
    if (confirm(`Are you sure you want to delete this component?`)) {
      this.formBuilderService.removeComponent(childId);
    }
  }

  getMaskedPlaceholder(): string {
    if (this.component.properties.mask) {
      // Convert mask to placeholder format
      return this.component.properties.mask
        .replace(/[09]/g, '_')
        .replace(/[A]/g, 'A')
        .replace(/[a]/g, 'a');
    }
    return this.component.placeholder || '';
  }

  private evaluateConditionalLogic(): void {
    // Only apply conditional logic in preview mode
    if (!this.previewMode) {
      this.isVisible = true;
      return;
    }

    const conditional = this.component.properties.conditional;

    if (!conditional || !conditional.when) {
      this.isVisible = true;
      return;
    }

    // Handle when field as either string (single ID or KEY) or array
    let watchedIdentifiers: string[] = [];

    if (Array.isArray(conditional.when)) {
      watchedIdentifiers = conditional.when.filter(id => id && id.trim());
    } else if (typeof conditional.when === 'string' && conditional.when.trim()) {
      watchedIdentifiers = [conditional.when.trim()];
    }

    if (watchedIdentifiers.length === 0) {
      this.isVisible = true;
      return;
    }

    // Only first identifier is supported currently
    const primaryIdentifier = watchedIdentifiers[0];

    // Find the component that this conditional logic depends on (by id or key)
    const watchedComponent = this.formBuilderService.getComponentById(primaryIdentifier)
      || this.formBuilderService.getComponentByKey(primaryIdentifier);

    if (!watchedComponent) {
      this.isVisible = true;
      return;
    }

    // Get the current value of the watched component (normalized in service)
    const watchedValue = this.formBuilderService.getComponentValueById(watchedComponent.id);

    if (watchedValue === null || watchedValue === undefined) {
      this.isVisible = true;
      return;
    }

    // Compare the watched value with the target value
    const conditionMet = String(watchedValue) === String(conditional.eq);

    // Determine visibility based on show flag and condition
    this.isVisible = conditional.show === 'true' ? conditionMet : !conditionMet;
  }

  private getComponentValue(component: FormComponent): any {
    // Handle different component types
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
      default:
        return component.value || '';
    }
  }

  // Panel collapse methods
  togglePanelCollapse(): void {
    if (this.component.type === ComponentType.PANEL && this.component.properties.collapsible) {
      this.panelCollapsed = !this.panelCollapsed;
      (this.component.properties as any).panelCollapsed = this.panelCollapsed;
      // Persist state so subsequent updates keep the collapse state
      const state = this.formBuilderService.getCurrentState();
      this.formBuilderService.updateState({ formSchema: { ...state.formSchema } });
    }
  }

  isPanelCollapsed(): boolean {
    if (this.component.type === ComponentType.PANEL && this.component.properties.collapsible) {
      return this.panelCollapsed;
    }
    return false;
  }

  expandPanel(): void {
    if (this.component.type === ComponentType.PANEL && this.component.properties.collapsible && this.panelCollapsed) {
      this.panelCollapsed = false;
    }
  }

  // Columns-specific methods
  getColumns(): ColumnDefinition[] {
    return this.component.properties.columns || [];
  }

  getColumnComponents(columnIndex: number): FormComponent[] {
    if (!this.component.children) return [];
    return this.component.children.filter(child => child.columnIndex === columnIndex);
  }

  getColumnsContainerClasses(): string {
    let classes = 'columns-container';

    if (this.component.properties.customClass) {
      classes += ' ' + this.component.properties.customClass;
    }

    if (this.component.properties.classes) {
      classes += ' ' + this.component.properties.classes.join(' ');
    }

    return classes;
  }

  getColumnClasses(column: ColumnDefinition): string {
    let classes = '';

    // Bootstrap column width
    if (column.width && column.width > 0) {
      classes += `col-${column.width}`;
    } else {
      classes += 'col';
    }

    // Bootstrap offset
    if (column.offset && column.offset > 0) {
      classes += ` offset-${column.offset}`;
    }

    // Bootstrap push/pull (legacy support)
    if (column.push && column.push > 0) {
      classes += ` order-${column.push}`;
    }

    if (column.pull && column.pull > 0) {
      classes += ` order-${-column.pull}`;
    }

    return classes;
  }

  trackByColumnIndex(index: number, column: ColumnDefinition): number {
    return index;
  }

  // Column drag and drop methods
  onColumnDragOver(event: DragEvent, columnIndex: number): void {
    if (!this.isColumnsType() || this.previewMode) return;

    event.preventDefault();
    event.stopPropagation();
    this.dragOverColumn = columnIndex;
    event.dataTransfer!.dropEffect = 'copy';
  }

  onColumnDragLeave(event: DragEvent, columnIndex: number): void {
    if (!this.isColumnsType() || this.previewMode) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    // Only clear dragOver if mouse is outside the column
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (this.dragOverColumn === columnIndex) {
        this.dragOverColumn = -1;
      }
    }
  }

  onColumnDrop(event: DragEvent, columnIndex: number): void {
    if (!this.isColumnsType() || this.previewMode) return;

    event.preventDefault();
    event.stopPropagation();
    this.dragOverColumn = -1;

    try {
      const data = JSON.parse(event.dataTransfer!.getData('application/json'));
      const columns = this.component.properties.columns || [];

      if (columnIndex >= 0 && columnIndex < columns.length) {
        if (data.componentType) {
          // Dropping from component palette into column
          const newComponent = this.formBuilderService.createComponent(data.componentType, this.component.id);
          newComponent.columnIndex = columnIndex;

          // Add to children array using FormBuilder service
          this.formBuilderService.addComponentToParentChildren(this.component.id, newComponent);
          this.formBuilderService.selectComponent(newComponent.id);

        } else if (data.component && data.component.id !== this.component.id) {
          // Moving existing component into column
          this.moveComponentToColumn(data.component, columnIndex);
        }
      }
    } catch (error) {
      console.error('Error handling column drop:', error);
    }
  }

  private moveComponentToColumn(draggedComponent: FormComponent, columnIndex: number): void {
    const columns = this.component.properties.columns || [];

    if (columnIndex >= 0 && columnIndex < columns.length) {
      // Remove from current location
      this.formBuilderService.removeComponent(draggedComponent.id);

      // Add to target column
      const newComponent = { ...draggedComponent, parentId: this.component.id, columnIndex };
      this.formBuilderService.addComponentToParentChildren(this.component.id, newComponent);
      this.formBuilderService.selectComponent(newComponent.id);
    }
  }

  // Column management methods
  addColumn(): void {
    if (!this.isColumnsType()) return;

    const columns = [...(this.component.properties.columns || [])];
    const newColumnCount = columns.length + 1;
    const newWidth = Math.floor(12 / newColumnCount);

    // Recalculate widths for all columns to maintain 12-column grid
    const updatedColumns = columns.map(() => ({
      width: newWidth,
      offset: 0,
      push: 0,
      pull: 0
    }));

    // Add new column
    updatedColumns.push({
      width: newWidth,
      offset: 0,
      push: 0,
      pull: 0
    });

    // Adjust widths to ensure they sum to 12
    const totalWidth = updatedColumns.reduce((sum, col) => sum + col.width, 0);
    const remainder = 12 - totalWidth;
    if (remainder > 0) {
      // Distribute remainder across columns
      for (let i = 0; i < remainder; i++) {
        updatedColumns[i % updatedColumns.length].width++;
      }
    }

    this.component.properties.columns = updatedColumns;
    this.triggerColumnsUpdate();
  }

  removeColumn(): void {
    if (!this.isColumnsType()) return;

    const columns = [...(this.component.properties.columns || [])];
    if (columns.length <= 1) return;

    const lastColumnIndex = columns.length - 1;

    // Remove components from the last column
    if (this.component.children) {
      const componentsToRemove = this.component.children.filter(child => child.columnIndex === lastColumnIndex);

      // Remove each component from the FormBuilder service
      componentsToRemove.forEach(component => {
        this.formBuilderService.removeComponent(component.id);
      });
    }

    // Remove the last column
    columns.pop();

    // Recalculate widths for remaining columns
    const newColumnCount = columns.length;
    const newWidth = Math.floor(12 / newColumnCount);

    const updatedColumns = columns.map(() => ({
      width: newWidth,
      offset: 0,
      push: 0,
      pull: 0
    }));

    // Adjust widths to ensure they sum to 12
    const totalWidth = updatedColumns.reduce((sum, col) => sum + col.width, 0);
    const remainder = 12 - totalWidth;
    if (remainder > 0) {
      // Distribute remainder across columns
      for (let i = 0; i < remainder; i++) {
        updatedColumns[i % updatedColumns.length].width++;
      }
    }

    this.component.properties.columns = updatedColumns;
    this.triggerColumnsUpdate();
  }

  private triggerColumnsUpdate(): void {
    // Force update of the component state to reflect changes
    const state = this.formBuilderService.getCurrentState();
    this.formBuilderService.updateState({
      formSchema: { ...state.formSchema },
      selectedComponent: this.component
    });
  }

  // DataGrid-specific methods
  getDataGridRows(): DataGridRow[] {
    return this.component.rows || [];
  }

  getDataGridContainerClasses(): string {
    let classes = 'datagrid-container mb-3';

    if (this.component.properties.customClass) {
      classes += ' ' + this.component.properties.customClass;
    }

    if (this.component.properties.classes) {
      classes += ' ' + this.component.properties.classes.join(' ');
    }

    return classes;
  }

  addDataGridRow(): void {
    // MUDANÇA: DataGrid só permite adicionar linhas no preview mode
    if (!this.isDataGridType() || !this.previewMode) return;

    if (!this.component.rows) {
      this.component.rows = [];
    }

    const newRow: DataGridRow = {
      id: this.generateRowId(),
      data: {},
      index: this.component.rows.length
    };

    // Initialize data with default values from child components (columns)
    if (this.component.children) {
      this.component.children.forEach(child => {
        newRow.data[child.key] = this.getDefaultValueForComponent(child);
      });
    }

    console.log('Adding new DataGrid row:', {
      componentId: this.component.id,
      rowId: newRow.id,
      initialData: newRow.data,
      totalRows: this.component.rows.length + 1
    });

    this.component.rows.push(newRow);
    this.updateDataGridState();
  }

  removeDataGridRow(rowIndex: number): void {
    // MUDANÇA: DataGrid só permite remover linhas no preview mode
    if (!this.isDataGridType() || !this.component.rows || !this.previewMode) return;

    const removedRow = this.component.rows[rowIndex];
    console.log('Removing DataGrid row:', {
      componentId: this.component.id,
      rowIndex: rowIndex,
      rowId: removedRow?.id,
      totalRowsBefore: this.component.rows.length
    });

    this.component.rows.splice(rowIndex, 1);

    // Update indices
    this.component.rows.forEach((row, index) => {
      row.index = index;
    });

    this.updateDataGridState();
  }

  isDataGridAtMaxRows(): boolean {
    if (!this.component.properties.maxLength) return false;
    return this.getDataGridRows().length >= this.component.properties.maxLength;
  }

  isDataGridAtMinRows(): boolean {
    if (!this.component.properties.minLength) return false;
    return this.getDataGridRows().length <= this.component.properties.minLength;
  }

  getDataGridColspan(): number {
    let colspan = (this.component.children?.length || 0);
    if (this.component.properties.reorder && !this.previewMode) colspan++;
    if (!this.component.properties.disableAddingRemovingRows && !this.previewMode) colspan++;
    return colspan;
  }

  trackByRowId(index: number, row: DataGridRow): string {
    return row.id;
  }

  getRowComponent(childComponent: FormComponent, row: DataGridRow, rowIndex: number): FormComponent {
    // Create a copy of the child component with the row's data
    const rowComponent: FormComponent = {
      ...childComponent,
      id: `${this.component.id}_${row.id}_${childComponent.key}`,
      value: row.data[childComponent.key] || this.getDefaultValueForComponent(childComponent),
      parentId: this.component.id
    };

    return rowComponent;
  }

  getRowValue(row: DataGridRow, key: string): any {
    return row.data[key];
  }

  getSampleValue(component: FormComponent): string {
    switch (component.type) {
      case ComponentType.INPUT:
      case ComponentType.EMAIL:
        return 'Sample text...';
      case ComponentType.NUMBER:
        return '123';
      case ComponentType.DATE:
        return '2024-01-01';
      case ComponentType.SELECT:
        return 'Option 1';
      case ComponentType.CHECKBOX:
        return '☑️';
      case ComponentType.TEXTAREA:
        return 'Sample text...';
      default:
        return 'Sample...';
    }
  }

  onRowComponentChange(event: any, row: DataGridRow, key: string): void {
    // This will be called when a component in the row changes
    console.log('DataGrid Row Change:', {
      rowId: row.id,
      key: key,
      oldValue: row.data?.[key],
      newValue: event,
      componentId: this.component.id
    });

    // Update the row data
    if (row.data) {
      row.data[key] = event;
    } else {
      row.data = { [key]: event };
    }

    this.updateDataGridState();
  }

  // DataGrid now uses the standard container drag & drop system
  // No need for custom row reordering in design mode

  private generateRowId(): string {
    return 'row_' + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultValueForComponent(component: FormComponent): any {
    switch (component.type) {
      case ComponentType.CHECKBOX:
        return false;
      case ComponentType.NUMBER:
        return 0;
      case ComponentType.SELECT:
        return '';
      default:
        return '';
    }
  }

  private updateDataGridState(): void {
    // MUDANÇA: Apenas atualizar dados do DataGrid no preview mode
    if (this.previewMode) {
      // Update component value with current rows data
      if (this.component.rows) {
        this.component.value = this.component.rows.map(row => row.data);
      } else {
        this.component.value = [];
      }

      // Debug: Log data changes
      console.log('DataGrid Update:', {
        componentId: this.component.id,
        key: this.component.key,
        rowsCount: this.component.rows?.length || 0,
        value: this.component.value
      });

      // Atualizar o componente no FormBuilderService para persistir mudanças
      this.formBuilderService.updateComponent(this.component.id, {
        rows: this.component.rows || [],
        value: this.component.value
      });

      // Emit value change to parent components
      this.valueChange.emit(this.component.value);

      // Force recursive validation update after DataGrid changes
      setTimeout(() => {
        this.formBuilderService.updateComponentAndParentsValidation(this.component.id);
      }, 50);
    } else {
      // No builder mode, não persistir dados do DataGrid
      console.log('Builder mode: dados do DataGrid não persistidos para', this.component.key);
    }
  }

  // Panel validation methods
  private isComponentValueEmpty(component: FormComponent): boolean {
    if (!component.value && component.value !== 0 && component.value !== false) {
      return true;
    }

    switch (component.type) {
      case ComponentType.INPUT:
      case ComponentType.TEXTAREA:
      case ComponentType.EMAIL:
      case ComponentType.PASSWORD:
      case ComponentType.URL:
      case ComponentType.TEL:
      case ComponentType.RICH_TEXT:
        return !component.value || String(component.value).trim() === '';

      case ComponentType.SELECT:
      case ComponentType.SELECT_API:
        return !component.value || component.value === '';

      case ComponentType.SELECT_BOX:
        return !component.value || (Array.isArray(component.value) && component.value.length === 0);

      case ComponentType.CHECKBOX:
        if (component.properties.options && component.properties.options.length > 0) {
          // Multi-checkbox: check if any option is selected
          return !component.properties.options.some(option => option.selected);
        } else {
          // Single checkbox: check if it's checked
          return !component.value;
        }

      case ComponentType.RADIO:
        return !component.value || component.value === '';

      case ComponentType.FILE:
        return !component.value || (Array.isArray(component.value) && component.value.length === 0);

      case ComponentType.NUMBER:
      case ComponentType.DATE:
        return component.value === null || component.value === undefined || component.value === '';

      default:
        return !component.value;
    }
  }

  // Panel validation methods removed - now using universal validation in FormBuilderService

  // Helper method to get full object from API option for SELECT_API
  private getFullObjectFromOption(option: any): any {
    if (!this.isSelectApiType() || !option) {
      return option?.value || option;
    }

    const config = this.component.properties.apiConfig;
    if (!config) {
      return option?.value || option;
    }

    // Find the original data from API response by matching the option
    const apiOption = this.apiOptions.find(apiOpt => apiOpt.value === option.value);
    if (apiOption && apiOption.originalData) {
      return apiOption.originalData;
    }

    // Fallback: construct object from option data
    const labelField = config.labelField || 'name';
    const valueField = config.valueField || 'id';

    return {
      [valueField]: option.value,
      [labelField]: option.label
    };
  }

  // Helper method to compare values for SELECT_API components
  private compareValues(value1: any, value2: any): boolean {
    if (!this.isSelectApiType()) {
      return value1 == value2;
    }

    const config = this.component.properties.apiConfig;
    const valueField = config?.valueField || 'id';

    // Extract comparison values
    let compareValue1: any;
    let compareValue2: any;

    if (typeof value1 === 'object' && value1 !== null) {
      compareValue1 = value1[valueField] || value1.value || value1.id || value1;
    } else {
      compareValue1 = value1;
    }

    if (typeof value2 === 'object' && value2 !== null) {
      compareValue2 = value2[valueField] || value2.value || value2.id || value2;
    } else {
      compareValue2 = value2;
    }

    return compareValue1 == compareValue2;
  }

  // Helper method to get display value for SELECT_API components
  getDisplayValue(): any {
    if (!this.isSelectApiType() || !this.value) {
      return this.value || '';
    }

    const config = this.component.properties.apiConfig;
    const valueField = config?.valueField || 'id';

    if (typeof this.value === 'object' && this.value !== null) {
      return this.value[valueField] || this.value.value || this.value.id || '';
    }

    return this.value;
  }

  // Validation error display methods
  shouldShowValidationError(): boolean {
    // Only show validation errors in preview mode
    if (!this.previewMode) {
      return false;
    }

    // Re-evaluate conditional logic to ensure up-to-date visibility status
    this.evaluateConditionalLogic();

    // IMPORTANT: Don't show validation errors if component is hidden by conditional logic
    if (!this.isVisible) {
      return false;
    }

    // IMPORTANT: Do not show validation messages for the DataGrid parent itself.
    // Validation should be shown on the internal cell components only.
    if (this.component.type === ComponentType.DATAGRID) {
      return false;
    }

    // Use direct validation from parent form-canvas if available
    const hasDirectError = this.showValidationError && this.validationErrorMessage.trim().length > 0;

    // Also check for validation errors from the form builder service
    if (this.formBuilderService && this.component) {
      const state = this.formBuilderService.getCurrentState();
      if (state.previewMode) {
        // Check if component is required and empty
        const isEmpty = this.isComponentEmpty();
        const hasError = this.component.required && isEmpty;

        if (hasError) {
          return true;
        }
      }
    }

    return hasDirectError;
  }

  getValidationErrorMessage(): string {
    // Re-evaluate conditional logic to ensure up-to-date visibility status
    this.evaluateConditionalLogic();

    // Don't show validation message if component is hidden by conditional logic
    if (!this.isVisible) {
      return '';
    }

    // IMPORTANT: DataGrid parent should not display validation message
    // Validation messages should only appear in the internal cell components
    if (this.component.type === ComponentType.DATAGRID) {
      return '';
    }

    if (this.validationErrorMessage && this.validationErrorMessage.trim().length > 0) {
      return this.validationErrorMessage;
    }

    // Generate default validation message if component is required and empty
    if (this.previewMode && this.component.required && this.isComponentEmpty()) {
      return `Campo obrigatório não preenchido: "${this.component.label || this.component.type}"`;
    }

    return '';
  }

  private isComponentEmpty(): boolean {
    const value = this.value;

    // Se não tem valor definido
    if (value === undefined || value === null) {
      return true;
    }

    // Verifica baseado no tipo de componente
    switch (this.component.type) {
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
        if (this.component.properties?.multiple) {
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

      default:
        return !value;
    }
  }
}
