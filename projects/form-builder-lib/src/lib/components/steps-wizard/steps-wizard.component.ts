import { Component, OnInit, OnDestroy, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilderService } from '../../services/form-builder.service';
import { FormStep, FormBuilderState } from '../../models/form-builder.models';

@Component({
  selector: 'app-steps-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './steps-wizard.component.html',
  styleUrls: ['./steps-wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepsWizardComponent implements OnInit, OnDestroy {
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

  editingStepId: string | null = null;
  editingTitle: string = '';

  private destroy$ = new Subject<void>();

  constructor(private formBuilderService: FormBuilderService, private cdr: ChangeDetectorRef, private appRef: ApplicationRef) {}

  ngOnInit(): void {
    this.formBuilderService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddStep(): void {
    const stepCount = this.state.formSchema.steps.length;
    this.formBuilderService.addStep(`Página ${stepCount + 1}`);
  }

  onStepPress(stepId: string, event: Event): void {
    // Immediate feedback
    this.formBuilderService.setStepLoading(true);

    // Prevent default to avoid focus/click oddities
    if (event && typeof (event as any).preventDefault === 'function') (event as any).preventDefault();

    // If already on this step, hide overlay quickly
    if (this.state.currentStep === stepId) {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => requestAnimationFrame(() => this.formBuilderService.setStepLoading(false)));
      } else {
        setTimeout(() => this.formBuilderService.setStepLoading(false), 50);
      }
      return;
    }

    // Schedule step switch on next frame so overlay paints first
    const finalize = () => {
      const sub = this.appRef.isStable.subscribe(stable => {
        if (stable) {
          this.formBuilderService.setStepLoading(false);
          sub.unsubscribe();
        }
      });
      setTimeout(() => this.formBuilderService.setStepLoading(false), 1500);
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        this.formBuilderService.setCurrentStep(stepId);
        finalize();
      });
    } else {
      setTimeout(() => {
        this.formBuilderService.setCurrentStep(stepId);
        finalize();
      }, 0);
    }
  }

  // Kept for compatibility (unused by template now)
  onSelectStep(stepId: string): void {
    this.onStepPress(stepId, new Event('click'));
  }

  onRemoveStep(stepId: string, event: Event): void {
    event.stopPropagation();
    
    if (this.state.formSchema.steps.length <= 1) {
      return; // Don't allow removing the last step
    }
    
    if (confirm('Are you sure you want to remove this step? All components in this step will be lost.')) {
      this.formBuilderService.removeStep(stepId);
    }
  }

  onMoveStep(stepId: string, direction: 'left' | 'right', event: Event): void {
    event.stopPropagation();
    this.formBuilderService.moveStep(stepId, direction);
  }

  onStartEdit(step: FormStep, event: Event): void {
    event.stopPropagation();
    this.editingStepId = step.id;
    this.editingTitle = step.title;
  }

  onSaveEdit(): void {
    if (this.editingStepId && this.editingTitle.trim()) {
      const step = this.state.formSchema.steps.find(s => s.id === this.editingStepId);
      if (step) {
        step.title = this.editingTitle.trim();
        this.formBuilderService.updateState({ 
          formSchema: { ...this.state.formSchema } 
        });
      }
    }
    this.cancelEdit();
  }

  onCancelEdit(): void {
    this.cancelEdit();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSaveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  isStepActive(stepId: string): boolean {
    return this.state.currentStep === stepId;
  }

  isStepSelected(stepId: string): boolean {
    return this.state.selectedStep?.id === stepId;
  }

  isStepDisabled(step: FormStep): boolean {
    return step.properties?.disabled || false;
  }

  isStepInvisible(step: FormStep): boolean {
    return step.properties?.invisible || false;
  }

  hasStepConditionalLogic(step: FormStep): boolean {
    return !!(step.properties?.conditional && step.properties.conditional.when);
  }

  shouldShowStep(step: FormStep): boolean {
    // Check if step is invisible
    if (this.isStepInvisible(step)) {
      return false;
    }

    // Only apply conditional logic in preview mode
    if (this.state.previewMode && step.properties?.conditional && step.properties.conditional.when) {
      return this.evaluateStepConditional(step.properties.conditional);
    }

    return true;
  }

  private evaluateStepConditional(conditional: any): boolean {
    if (!conditional.when) {
      return true; // No condition means always show
    }

    // Handle when field as either string (single ID) or array of IDs
    let watchedComponentIds: string[] = [];

    if (Array.isArray(conditional.when)) {
      watchedComponentIds = conditional.when.filter((id: any) => id && String(id).trim());
    } else if (conditional.when && String(conditional.when).trim()) {
      watchedComponentIds = [String(conditional.when).trim()];
    }

    if (watchedComponentIds.length === 0) {
      return true;
    }

    const primaryComponentId = watchedComponentIds[0];

    // Get the component value by ID using the service
    const componentValue = String(this.formBuilderService.getComponentValueById(primaryComponentId));

    // Normalize expected values (support single value or array)
    const expectedValues = Array.isArray(conditional.eq)
      ? conditional.eq.map((v: any) => String(v))
      : [String(conditional.eq)];

    // If componentValue is CSV (multi-select), split for matching
    const actualValues = componentValue.includes(',') ? componentValue.split(',').map(v => v.trim()) : [componentValue];

    const conditionMet = actualValues.some(v => expectedValues.includes(v));

    // Normalize show flag
    const show = typeof conditional.show === 'string' ? (conditional.show === 'true') : !!conditional.show;

    return show ? conditionMet : !conditionMet;
  }

  canMoveLeft(step: FormStep): boolean {
    return step.order > 0;
  }

  canMoveRight(step: FormStep): boolean {
    return step.order < this.state.formSchema.steps.length - 1;
  }

  getStepNumber(step: FormStep): number {
    return step.order + 1;
  }

  trackByStepId(index: number, step: FormStep): string {
    return step.id;
  }

  canNavigatePrevious(): boolean {
    const currentIndex = this.state.formSchema.steps.findIndex(s => s.id === this.state.currentStep);
    return currentIndex > 0;
  }

  canNavigateNext(): boolean {
    const currentIndex = this.state.formSchema.steps.findIndex(s => s.id === this.state.currentStep);
    return currentIndex < this.state.formSchema.steps.length - 1;
  }

  navigatePrevious(): void {
    const currentIndex = this.state.formSchema.steps.findIndex(s => s.id === this.state.currentStep);
    if (currentIndex > 0) {
      const previousStep = this.state.formSchema.steps[currentIndex - 1];
      this.formBuilderService.setCurrentStep(previousStep.id);
    }
  }

  navigateNext(): void {
    const currentIndex = this.state.formSchema.steps.findIndex(s => s.id === this.state.currentStep);
    if (currentIndex < this.state.formSchema.steps.length - 1) {
      const nextStep = this.state.formSchema.steps[currentIndex + 1];
      this.formBuilderService.setCurrentStep(nextStep.id);
    }
  }

  getCurrentStepNumber(): number {
    const currentIndex = this.state.formSchema.steps.findIndex(s => s.id === this.state.currentStep);
    return currentIndex + 1;
  }

  private cancelEdit(): void {
    this.editingStepId = null;
    this.editingTitle = '';
  }

  // Método para atualizar validação de todos os steps
  private updateStepsValidation(): void {
    // Só executar validação no preview mode
    if (this.state.previewMode) {
      this.state.formSchema.steps.forEach(step => {
        step.valid = this.formBuilderService.validateStep(step);
      });
    }
  }

  // Método para verificar se um step é válido
  isStepValid(step: FormStep): boolean {
    return step.valid !== false; // true por padrão se não foi calculado ainda
  }

  // Método para obter o ícone de validação
  getValidationIcon(step: FormStep): string {
    const isValid = this.isStepValid(step);
    return isValid ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger';
  }

  // Método para verificar se deve mostrar ícone de validação
  shouldShowValidationIcon(step: FormStep): boolean {
    // Só mostra ícone no preview mode e se o step tem componentes
    return this.state.previewMode && step.components && step.components.length > 0;
  }
}
