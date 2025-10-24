import { Injectable } from '@angular/core';
import { FormComponent, FormStep, ComponentType } from '../models/form-builder.models';

export interface ValidationError {
  componentId: string;
  componentKey: string;
  componentLabel: string;
  message: string;
  stepId: string;
  stepTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {}

  /**
   * Checks if a component type should not be validated
   */
  private isNonValidatableComponent(type: ComponentType): boolean {
    const nonValidatableTypes = [
      ComponentType.TEXT_HELP,
      ComponentType.PANEL,
      ComponentType.COLUMNS
    ];

    return nonValidatableTypes.includes(type);
  }

  /**
   * Checks if a component should be validated based on its visibility and state
   * Public method for use by other services
   */
  public isComponentValidatable(component: FormComponent, formBuilderService?: any): boolean {
    // Check if component is disabled
    if (component.properties?.disabled) {
      return false;
    }

    // Check if component is hidden
    if (component.properties?.hidden) {
      return false;
    }

    // Check conditional logic
    if (component.properties?.conditional && component.properties.conditional.when) {
      const isVisible = this.evaluateConditionalLogic(component.properties.conditional, component, formBuilderService);
      if (!isVisible) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluates conditional logic for a component
   */
  private evaluateConditionalLogic(conditional: any, component: FormComponent, formBuilderService?: any): boolean {
    if (!conditional.when) {
      return true; // No condition means always visible
    }

    // Handle when field as either string (single ID or KEY) or array
    let watchedIdentifiers: string[] = [];

    if (Array.isArray(conditional.when)) {
      watchedIdentifiers = conditional.when.filter((id: string) => id && String(id).trim());
    } else if (typeof conditional.when === 'string' && conditional.when.trim()) {
      watchedIdentifiers = [conditional.when.trim()];
    }

    if (watchedIdentifiers.length === 0) {
      return true;
    }

    // Only first identifier is supported currently
    const primaryIdentifier = watchedIdentifiers[0];

    if (!formBuilderService) {
      console.warn('FormBuilderService not available for conditional logic evaluation');
      return true;
    }

    // Resolve watched component by ID first, then by KEY
    const watchedComponent = formBuilderService.getComponentById(primaryIdentifier)
      || formBuilderService.getComponentByKey(primaryIdentifier);

    if (!watchedComponent) {
      return true;
    }

    // Get the current value of the watched component (normalized for comparison)
    const watchedValue = String(formBuilderService.getComponentValueById(watchedComponent.id));

    // Normalize expected values (support single value or array)
    const expected = Array.isArray(conditional.eq)
      ? conditional.eq.map((v: any) => String(v))
      : [String(conditional.eq)];

    // If watchedValue is CSV (multi-select), split for matching
    const watchedValues = watchedValue.includes(',') ? watchedValue.split(',').map(v => v.trim()) : [watchedValue];

    const conditionMet = watchedValues.some(v => expected.includes(v));

    // Normalize show flag (accept boolean or string)
    const showFlag = typeof conditional.show === 'string' ? (conditional.show === 'true') : !!conditional.show;

    // Determine visibility based on show flag and condition
    return showFlag ? conditionMet : !conditionMet;
  }

  /**
   * Validates all components in a step and returns detailed error messages
   */
  validateStepWithErrors(step: FormStep, formBuilderService?: any): ValidationError[] {
    const errors: ValidationError[] = [];
    this.validateComponentsRecursively(step.components, errors, step.id, step.title, undefined, formBuilderService);
    return errors;
  }

  /**
   * Validates all steps and returns detailed error messages
   */
  validateAllStepsWithErrors(steps: FormStep[], formBuilderService?: any): ValidationError[] {
    const allErrors: ValidationError[] = [];

    steps.forEach(step => {
      const stepErrors = this.validateStepWithErrors(step, formBuilderService);
      allErrors.push(...stepErrors);
    });

    return allErrors;
  }

  /**
   * Recursively validates components and collects errors
   */
  private validateComponentsRecursively(
    components: FormComponent[],
    errors: ValidationError[],
    stepId: string,
    stepTitle: string,
    parentLabel?: string,
    formBuilderService?: any
  ): void {
    components.forEach(component => {
      // First: if the component is not visible/validatable (hidden/disabled/conditional),
      // skip it AND its children entirely
      if (!this.isComponentValidatable(component, formBuilderService)) {
        return;
      }

      // For layout components (PANEL, COLUMNS) and Text Help: do not validate themselves,
      // but still validate their visible children
      if (this.isNonValidatableComponent(component.type)) {
        if (component.children && component.children.length > 0) {
          this.validateComponentsRecursively(component.children, errors, stepId, stepTitle, parentLabel, formBuilderService);
        }
        return;
      }

      // Special handling for DataGrid - only validate individual cells, not the component itself
      if (component.type === ComponentType.DATAGRID) {
        console.log('Validating DataGrid:', {
          componentId: component.id,
          label: component.label,
          required: component.required,
          rowsCount: component.rows?.length || 0,
          childrenCount: component.children?.length || 0
        });

        if (component.children && component.rows) {
          const errorsBefore = errors.length;
          this.validateDataGridRows(component, errors, stepId, stepTitle);
          const errorsAdded = errors.length - errorsBefore;
          console.log(`DataGrid validation added ${errorsAdded} cell-level errors`);
        }
        return;
      }

      // Validate current component only if it's required (for non-DataGrid components)
      if (component.required) {
        const isValid = !this.isComponentEmpty(component);

        if (!isValid) {
          const componentLabel = this.getComponentDisplayLabel(component, parentLabel);
          const message = this.getValidationMessage(component, componentLabel);

          errors.push({
            componentId: component.id,
            componentKey: component.key,
            componentLabel,
            message,
            stepId,
            stepTitle
          });
        }
      }

      // Validate children components (for non-DataGrid components)
      if (component.children && component.children.length > 0) {
        this.validateComponentsRecursively(component.children, errors, stepId, stepTitle, parentLabel, formBuilderService);
      }
    });
  }

  /**
   * Validates DataGrid rows and their cells
   */
  private validateDataGridRows(
    dataGridComponent: FormComponent, 
    errors: ValidationError[], 
    stepId: string, 
    stepTitle: string
  ): void {
    if (!dataGridComponent.children || !dataGridComponent.rows) {
      return;
    }

    dataGridComponent.rows.forEach((row, rowIndex) => {
      dataGridComponent.children!.forEach(childComponent => {
        if (childComponent.required) {
          const cellValue = row.data[childComponent.key];
          
          if (this.isValueEmpty(cellValue, childComponent.type)) {
            const componentLabel = `${dataGridComponent.label || 'Tabela'} - Linha ${rowIndex + 1} - ${childComponent.label || childComponent.type}`;
            const message = `Campo obrigatório não preenchido em "${componentLabel}"`;
            
            errors.push({
              componentId: `${dataGridComponent.id}_row_${row.id}_${childComponent.id}`,
              componentKey: `${dataGridComponent.key}.${row.index}.${childComponent.key}`,
              componentLabel,
              message,
              stepId,
              stepTitle
            });
          }
        }
      });
    });
  }

  /**
   * Gets a display-friendly label for a component
   */
  private getComponentDisplayLabel(component: FormComponent, parentLabel?: string): string {
    let label = component.label || this.getComponentTypeLabel(component.type);
    
    if (parentLabel) {
      label = `${parentLabel} - ${label}`;
    }
    
    return label;
  }

  /**
   * Gets a user-friendly label for component types
   */
  private getComponentTypeLabel(type: ComponentType): string {
    const typeLabels: { [key in ComponentType]: string } = {
      [ComponentType.INPUT]: 'Campo de Texto',
      [ComponentType.TEXTAREA]: 'Área de Texto',
      [ComponentType.SELECT]: 'Lista de Seleção',
      [ComponentType.SELECT_BOX]: 'Caixa de Seleção',
      [ComponentType.SELECT_API]: 'Lista de Seleção API',
      [ComponentType.CHECKBOX]: 'Caixa de Verificação',
      [ComponentType.RADIO]: 'Botão de Opção',
      [ComponentType.DATE]: 'Campo de Data',
      [ComponentType.FILE]: 'Upload de Arquivo',
      [ComponentType.NUMBER]: 'Campo Numérico',
      [ComponentType.EMAIL]: 'Campo de E-mail',
      [ComponentType.PASSWORD]: 'Campo de Senha',
      [ComponentType.URL]: 'Campo de URL',
      [ComponentType.TEL]: 'Campo de Telefone',
      [ComponentType.RICH_TEXT]: 'Editor de Texto Rico',
      [ComponentType.PANEL]: 'Painel',
      [ComponentType.COLUMNS]: 'Colunas',
      [ComponentType.DATAGRID]: 'Tabela de Dados',
      [ComponentType.TEXT_HELP]: 'Texto de Ajuda',
      [ComponentType.BUTTON]: 'Botão',
      [ComponentType.TABS]: 'Abas',
      [ComponentType.ACCORDION]: 'Accordion',
      [ComponentType.GRID]: 'Grade'
    };

    return typeLabels[type] || type;
  }

  /**
   * Gets validation message for a component
   */
  private getValidationMessage(component: FormComponent, componentLabel: string): string {
    return `Campo obrigatório não preenchido: "${componentLabel}"`;
  }

  /**
   * Checks if a component is empty
   */
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
        // Se DataGrid obrigatório está vazio, é inválido
        if (!component.rows || component.rows.length === 0) {
          return true; // DataGrid vazio é considerado vazio (inválido se required)
        }

        // Verificar se todos os campos obrigatórios em todas as linhas estão preenchidos
        if (component.children) {
          for (const row of component.rows) {
            for (const childComponent of component.children) {
              if (childComponent.required) {
                const cellValue = row.data[childComponent.key];
                if (this.isValueEmpty(cellValue, childComponent.type)) {
                  return true; // Se algum campo obrigatório está vazio, DataGrid é inválido
                }
              }
            }
          }
        }
        return false; // DataGrid com linhas preenchidas corretamente

      default:
        return !value;
    }
  }

  /**
   * Checks if a value is empty for a specific component type
   */
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

  /**
   * Focus on a specific component by ID
   * This method will expand panels if needed and scroll to the element
   */
  focusComponent(componentId: string): void {
    // Use a timeout to ensure the DOM is ready
    setTimeout(() => {
      // Try different selectors to find the component
      const selectors = [
        `[data-component-id="${componentId}"]`,
        `#${componentId}`,
        `[id="${componentId}"]`,
        `[data-testid="${componentId}"]`
      ];

      let element: HTMLElement | null = null;

      for (const selector of selectors) {
        element = document.querySelector(selector) as HTMLElement;
        if (element) break;
      }

      if (element) {
        // First, expand any collapsed panels containing this component
        this.expandParentPanels(element);

        // Wait a bit for panel expansion animation to complete
        setTimeout(() => {
          // Focus on the first focusable element within the component
          const focusableElements = element!.querySelectorAll(
            'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements.length > 0) {
            const firstFocusable = focusableElements[0] as HTMLElement;

            // Scroll into view first
            firstFocusable.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });

            // Then focus
            setTimeout(() => {
              firstFocusable.focus();

              // Add visual highlight
              this.addTemporaryHighlight(firstFocusable);
            }, 300);
          } else {
            // If no focusable element, scroll to the component itself
            element!.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });

            // Add visual highlight to the component container
            this.addTemporaryHighlight(element!);
          }
        }, 200);
      } else {
        console.warn('Component not found for focusing:', componentId);
      }
    }, 100);
  }

  /**
   * Expand all parent panels that contain the target element
   */
  private expandParentPanels(element: HTMLElement): void {
    let currentElement = element.parentElement;

    while (currentElement) {
      // Look for collapsed panels (Bootstrap collapse or custom panels)
      const collapseElement = currentElement.querySelector('.collapse:not(.show)');
      if (collapseElement) {
        // Try to find the toggle button and click it
        const toggleButton = document.querySelector(`[data-bs-target="#${collapseElement.id}"], [href="#${collapseElement.id}"]`) as HTMLElement;
        if (toggleButton) {
          toggleButton.click();
        } else {
          // If no toggle button found, manually add the 'show' class
          collapseElement.classList.add('show');
        }
      }

      // Look for custom collapsible panels (Form Builder specific)
      if (currentElement.classList.contains('panel-content') && currentElement.style.display === 'none') {
        currentElement.style.display = 'block';

        // Try to find and update any toggle icons
        const toggleIcon = currentElement.parentElement?.querySelector('.collapse-icon i');
        if (toggleIcon) {
          toggleIcon.classList.remove('bi-chevron-down', 'fas fa-square-plus');
          toggleIcon.classList.add('bi-chevron-up', 'fas fa-square-minus');
        }
      }

      // Look for form-component-renderer panels
      if (currentElement.classList.contains('card-body') && currentElement.style.display === 'none') {
        currentElement.style.display = 'block';

        // Find parent panel component and update its state
        const panelComponent = currentElement.closest('[data-component-id]');
        if (panelComponent) {
          const toggleIcon = panelComponent.querySelector('.collapse-icon i');
          if (toggleIcon) {
            toggleIcon.classList.remove('fas fa-square-plus');
            toggleIcon.classList.add('fas fa-square-minus');
          }
        }
      }

      // Check if current element itself is a collapsed panel
      if (currentElement.classList.contains('collapsed')) {
        currentElement.classList.remove('collapsed');
      }

      // Check for form builder panel components specifically
      if (currentElement.hasAttribute('data-component-id')) {
        const componentType = currentElement.getAttribute('data-component-type');
        if (componentType === 'panel') {
          // Find the panel body and expand it if collapsed
          const panelBody = currentElement.querySelector('.card-body');
          if (panelBody && panelBody.getAttribute('style')?.includes('display: none')) {
            (panelBody as HTMLElement).style.display = 'block';

            // Update the collapse icon
            const collapseIcon = currentElement.querySelector('.collapse-icon i');
            if (collapseIcon) {
              collapseIcon.classList.remove('fas fa-square-plus');
              collapseIcon.classList.add('fas fa-square-minus');
            }
          }
        }
      }

      currentElement = currentElement.parentElement;
    }
  }

  /**
   * Add temporary visual highlight to an element
   */
  private addTemporaryHighlight(element: HTMLElement): void {
    const originalBoxShadow = element.style.boxShadow;
    const originalTransition = element.style.transition;

    // Add highlight
    element.style.transition = 'box-shadow 0.3s ease';
    element.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.6), 0 0 20px rgba(255, 193, 7, 0.3)';

    // Remove highlight after 2 seconds
    setTimeout(() => {
      element.style.transition = originalTransition;
      element.style.boxShadow = originalBoxShadow;
    }, 2000);
  }

  /**
   * Expand all panels that contain components with validation errors
   */
  expandPanelsWithErrors(validationErrors: ValidationError[]): void {
    // Use a timeout to ensure DOM is ready
    setTimeout(() => {
      validationErrors.forEach(error => {
        this.expandPanelForComponent(error.componentId);
      });
    }, 100);
  }

  /**
   * Expand panel for a specific component
   */
  private expandPanelForComponent(componentId: string): void {
    const selectors = [
      `[data-component-id="${componentId}"]`,
      `#${componentId}`,
      `[id="${componentId}"]`
    ];

    let targetElement: HTMLElement | null = null;

    for (const selector of selectors) {
      targetElement = document.querySelector(selector) as HTMLElement;
      if (targetElement) break;
    }

    if (targetElement) {
      // Look for parent panel components
      let currentElement = targetElement.parentElement;

      while (currentElement) {
        // Check if this element is a panel component
        if (currentElement.hasAttribute('data-component-id')) {
          const panelId = currentElement.getAttribute('data-component-id');
          const componentType = currentElement.getAttribute('data-component-type');

          if (componentType === 'panel') {
            // Try to find and click the collapse toggle if panel is collapsed
            const cardBody = currentElement.querySelector('.card-body') as HTMLElement;
            if (cardBody && cardBody.style.display === 'none') {
              const toggleElement = currentElement.querySelector('.card-header [style*="cursor: pointer"]') as HTMLElement;
              if (toggleElement) {
                toggleElement.click();
              }
            }
          }
        }

        currentElement = currentElement.parentElement;
      }
    }
  }

  /**
   * Debug method to test validation for a specific step
   */
  debugValidationForStep(step: FormStep, formBuilderService?: any): void {
    console.log('=== Debug Validation ===');
    console.log('Step:', step.title, '(ID:', step.id, ')');

    const errors = this.validateStepWithErrors(step, formBuilderService);

    console.log('Total validation errors found:', errors.length);
    errors.forEach((error, index) => {
      console.log(`Error ${index + 1}:`, {
        component: error.componentLabel,
        message: error.message,
        componentId: error.componentId,
        componentKey: error.componentKey
      });
    });

    console.log('=== End Debug Validation ===');
    return;
  }
}
