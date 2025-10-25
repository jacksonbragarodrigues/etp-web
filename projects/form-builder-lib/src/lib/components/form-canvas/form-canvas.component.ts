import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilderService } from '../../services/form-builder.service';
import { ValidationService, ValidationError } from '../../services/validation.service';
import { FormComponent, FormBuilderState, ComponentType, DragDropData } from '../../models/form-builder.models';
import { FormComponentRendererComponent } from '../form-component-renderer/form-component-renderer.component';

@Component({
  selector: 'app-form-canvas',
  standalone: true,
  imports: [CommonModule, FormComponentRendererComponent],
  templateUrl: './form-canvas.component.html',
  styleUrls: ['./form-canvas.component.scss']
})
export class FormCanvasComponent implements OnInit, OnDestroy {
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

  isDragOver: boolean[] = [];

  dragOverIndex: number = -1;
  hoveredComponentId: string | null = null;
  currentStepValidationErrors: ValidationError[] = [];
  showValidationErrors: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilderService: FormBuilderService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.isDragOver = Array(this.getCurrentStepComponents().length).fill(false);
    this.formBuilderService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        this.updateValidationErrors();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentStepComponents(): FormComponent[] {
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    return currentStep?.components || [];
  }

  onDragOver(event: DragEvent, index: number): void {
    console.log(event);
    console.log(index);
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    //this.dragOverIndex = index ?? -1;
    this.isDragOver[index] = true;
  }

  onDragLeave(event: DragEvent, index: number): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    // Only clear dragOverIndex if mouse is outside the drop zone
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      //this.dragOverIndex = -1;
    }
    this.isDragOver[index] = false;
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    event.stopPropagation(); // Prevent event bubbling
    //this.dragOverIndex = -1;
this.isDragOver[targetIndex] = false;
    try {
      const data = JSON.parse(event.dataTransfer!.getData('application/json')) as DragDropData;

      if (data.componentType) {
        // Dropping from component palette
        const component = this.formBuilderService.createComponent(data.componentType);
        this.insertComponentAtIndex(component, targetIndex);
      } else if (data.component) {
        // Moving existing component
        this.moveComponent(data.component, data.sourceIndex, targetIndex);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }

  onComponentSelect(component: FormComponent): void {
    this.formBuilderService.selectComponent(component.id);
  }

  onComponentDelete(componentId: string): void {
    if (confirm('Are you sure you want to delete this component?')) {
      this.formBuilderService.removeComponent(componentId);
    }
  }

  onOpenProperties(component: FormComponent): void {
    // Select component and ensure properties panel is visible
    this.formBuilderService.selectComponent(component.id);
    // Open properties tab
    this.formBuilderService.openPropertiesTab();
  }

  onComponentDragStart(event: DragEvent, component: FormComponent, index: number): void {
    const data: DragDropData = {
      component,
      sourceIndex: index,
      sourceParentId: component.parentId
    };
    
    event.dataTransfer!.setData('application/json', JSON.stringify(data));
    event.dataTransfer!.effectAllowed = 'move';
    
    this.formBuilderService.updateState({ dragInProgress: true });
  }

  onComponentDragEnd(): void {
    this.formBuilderService.updateState({ dragInProgress: false });
   // this.dragOverIndex = -1;
  }

  isComponentSelected(componentId: string): boolean {
    return this.state.selectedComponent?.id === componentId;
  }

  isComponentHovered(componentId: string): boolean {
    return this.hoveredComponentId === componentId;
  }

  onComponentHover(componentId: string): void {
    this.hoveredComponentId = componentId;
  }

  onComponentUnhover(): void {
    this.hoveredComponentId = null;
  }

  getDropZoneClass(index: number): string {
    console.log('getDropZoneClass called for index:', index);
    console.log('dragOverIndex:', this.dragOverIndex);
    console.log('state.dragInProgress:', this.state.dragInProgress);

    let classes = 'drop-zone';
    if (this.dragOverIndex === index) {
      classes += ' drag-over';
    }
    if (this.state.dragInProgress) {
      classes += ' drag-active';
    }
    return classes;
  }

  trackByComponentId(index: number, component: FormComponent): string {
    return component.id;
  }

  private insertComponentAtIndex(component: FormComponent, targetIndex?: number): void {
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    if (!currentStep) return;

    if (targetIndex !== undefined && targetIndex >= 0) {
      currentStep.components.splice(targetIndex, 0, component);
    } else {
      currentStep.components.push(component);
    }

    this.formBuilderService.updateState({ 
      formSchema: { ...this.state.formSchema },
      selectedComponent: component
    });
  }

  private moveComponent(component: FormComponent, sourceIndex?: number, targetIndex?: number): void {
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    if (!currentStep) return;

    // Remove from source position
    if (sourceIndex !== undefined && sourceIndex >= 0) {
      currentStep.components.splice(sourceIndex, 1);
    }

    // Insert at target position
    if (targetIndex !== undefined && targetIndex >= 0) {
      currentStep.components.splice(targetIndex, 0, component);
    } else {
      currentStep.components.push(component);
    }

    this.formBuilderService.updateState({ 
      formSchema: { ...this.state.formSchema }
    });
  }

  clearCanvas(): void {
    if (confirm('Are you sure you want to clear all components? This action cannot be undone.')) {
      const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
      if (currentStep) {
        currentStep.components = [];
        this.formBuilderService.updateState({
          formSchema: { ...this.state.formSchema },
          selectedComponent: null
        });
      }
    }
  }

  validateForm(): void {
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    if (!currentStep) return;

    const issues: string[] = [];

    // Check for components without labels
    const unlabeledComponents = currentStep.components.filter(c => !c.label || c.label.trim() === '');
    if (unlabeledComponents.length > 0) {
      issues.push(`${unlabeledComponents.length} component(s) without labels`);
    }

    // Check for required validations
    const requiredComponents = currentStep.components.filter(c => c.required);
    if (requiredComponents.length === 0) {
      issues.push('No required fields defined');
    }

    if (issues.length === 0) {
      alert('Form validation passed! No issues found.');
    } else {
      alert(`Form validation issues:\n- ${issues.join('\n- ')}`);
    }
  }

  addQuickComponent(type: string): void {
    const componentType = type as ComponentType;
    const component = this.formBuilderService.createComponent(componentType);
    this.formBuilderService.addComponent(component);
  }

  private generateId(): string {
    return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Validation methods
  updateValidationErrors(): void {
    // Only show validation errors in preview mode and when flag is set
    if (!this.state.previewMode || !this.showValidationErrors) {
      this.currentStepValidationErrors = [];
      return;
    }

    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    if (currentStep) {
      this.currentStepValidationErrors = this.validationService.validateStepWithErrors(currentStep, this.formBuilderService);
    } else {
      this.currentStepValidationErrors = [];
    }
  }

  onValidationErrorClick(error: ValidationError): void {
    this.validationService.focusComponent(error.componentId);
  }

  hasValidationErrors(): boolean {
    return this.currentStepValidationErrors.length > 0;
  }

  getValidationErrorsCount(): number {
    return this.currentStepValidationErrors.length;
  }

  // Methods to control validation error display
  showValidationErrorsForCurrentStep(): void {
    this.showValidationErrors = true;
    this.updateValidationErrors();
  }

  hideValidationErrors(): void {
    this.showValidationErrors = false;
    this.currentStepValidationErrors = [];
  }

  // Method for external components to trigger validation
  validateCurrentStep(): ValidationError[] {
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    if (currentStep) {
      return this.validationService.validateStepWithErrors(currentStep, this.formBuilderService);
    }
    return [];
  }

  // Methods for individual component validation errors
  hasComponentValidationError(componentId: string): boolean {
    return this.currentStepValidationErrors.some(error => error.componentId === componentId);
  }

  getComponentValidationError(componentId: string): string {
    const error = this.currentStepValidationErrors.find(error => error.componentId === componentId);
    return error ? error.message : '';
  }

  // Check if any nested component has validation errors
  hasNestedValidationErrors(component: FormComponent): boolean {
    // Check current component
    if (this.hasComponentValidationError(component.id)) {
      return true;
    }

    // Check children recursively
    if (component.children && component.children.length > 0) {
      return component.children.some(child => this.hasNestedValidationErrors(child));
    }

    return false;
  }
}
