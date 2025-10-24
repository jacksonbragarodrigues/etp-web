import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilderService } from '../../services/form-builder.service';
import { FormComponent, FormBuilderState, TreeNode, ComponentType } from '../../models/form-builder.models';

@Component({
  selector: 'app-hierarchy-tree',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hierarchy-tree.component.html',
  styleUrls: ['./hierarchy-tree.component.scss']
})
export class HierarchyTreeComponent implements OnInit, OnDestroy {
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

  treeNodes: TreeNode[] = [];
  filteredTreeNodes: TreeNode[] = [];
  draggedNode: TreeNode | null = null;
  expandedNodes: Set<string> = new Set();
  dragOverNode: TreeNode | null = null;
  private dragInProgress: boolean = false;

  // Filter properties
  filterRequiredTrue: boolean = false;
  filterRequiredFalse: boolean = false;
  filterConditionalShow: boolean = false;
  filterConditionalHide: boolean = false;
  private allComponents: FormComponent[] = [];

  // Accordion state
  filtersAccordionExpanded: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private formBuilderService: FormBuilderService) {}

  ngOnInit(): void {
    this.formBuilderService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        this.buildTree();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildTree(): void {
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    if (!currentStep) {
      this.treeNodes = [];
      this.filteredTreeNodes = [];
      this.allComponents = [];
      return;
    }

    this.allComponents = currentStep.components;
    this.treeNodes = this.buildTreeNodes(currentStep.components);
    this.applyFilters();
  }

  private buildTreeNodes(components: FormComponent[]): TreeNode[] {
    return components.map(component => ({
      id: component.id,
      label: component.label || component.type,
      type: component.type,
      children: component.children ? this.buildTreeNodes(component.children) : undefined,
      expanded: this.expandedNodes.has(component.id),
      selected: this.state.selectedComponent?.id === component.id,
      parentId: component.parentId
    }));
  }

  onNodeClick(node: TreeNode): void {
    this.formBuilderService.selectComponent(node.id);
  }

  onToggleExpanded(node: TreeNode, event: Event): void {
    event.stopPropagation();
    
    if (this.expandedNodes.has(node.id)) {
      this.expandedNodes.delete(node.id);
    } else {
      this.expandedNodes.add(node.id);
    }
    
    this.buildTree();
  }

  onDragStart(event: DragEvent, node: TreeNode): void {
    event.stopPropagation(); // Prevent event bubbling to parent nodes

    // Prevent multiple drag starts
    if (this.dragInProgress) {
      console.log('Drag already in progress, ignoring');
      event.preventDefault();
      return;
    }

    this.dragInProgress = true;
    this.draggedNode = node;
    console.log('Starting drag for node:', {
      id: node.id,
      label: node.label,
      type: node.type,
      parentId: node.parentId
    });

    event.dataTransfer!.setData('application/json', JSON.stringify({
      nodeId: node.id,
      source: 'tree'
    }));
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragEnd(event: DragEvent): void {
    event.stopPropagation(); // Prevent event bubbling to parent nodes
    this.cleanupDragState();
  }

  onDragOver(event: DragEvent, targetNode?: TreeNode): void {
    event.preventDefault();
    event.stopPropagation(); // Prevent event bubbling to parent nodes

    // Only process if we have a valid drag operation
    if (!this.draggedNode) {
      event.dataTransfer!.dropEffect = 'none';
      return;
    }

    event.dataTransfer!.dropEffect = 'move';

    // Prevent dropping on self or children
    if (targetNode && this.draggedNode) {
      if (targetNode.id === this.draggedNode.id || this.isDescendant(targetNode, this.draggedNode)) {
        event.dataTransfer!.dropEffect = 'none';
        this.dragOverNode = null;
        return;
      }
    }

    this.dragOverNode = targetNode || null;
  }

  onDrop(event: DragEvent, targetNode?: TreeNode): void {
    event.preventDefault();
    event.stopPropagation();

    console.log('Drop event triggered:', {
      draggedNode: this.draggedNode ? {
        id: this.draggedNode.id,
        label: this.draggedNode.label,
        parentId: this.draggedNode.parentId
      } : null,
      targetNode: targetNode ? {
        id: targetNode.id,
        label: targetNode.label,
        parentId: targetNode.parentId
      } : null
    });

    if (!this.draggedNode) {
      console.warn('No dragged node found');
      return;
    }

    try {
      const data = JSON.parse(event.dataTransfer!.getData('application/json'));
      console.log('Drop data:', data);

      if (data.source === 'tree' && data.nodeId !== targetNode?.id) {
        console.log('Proceeding with move operation');
        this.moveNode(this.draggedNode, targetNode);
      } else {
        console.log('Drop cancelled - same node or invalid source');
      }
    } catch (error) {
      console.error('Error handling tree drop:', error);
    }

    // Ensure proper cleanup after drop
    this.cleanupDragState();
  }

  private cleanupDragState(): void {
    // Prevent multiple cleanup calls
    if (!this.dragInProgress) {
      return;
    }

    console.log('Cleaning up drag state');
    this.draggedNode = null;
    this.dragOverNode = null;
    this.dragInProgress = false;

    // Force a tree rebuild to ensure consistency
    setTimeout(() => {
      this.buildTree();
      console.log('Tree rebuilt after drag operation');
    }, 50);
  }

  onDuplicateNode(node: TreeNode, event: Event): void {
    event.stopPropagation();
    
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    if (!currentStep) return;

    const component = this.findComponentById(currentStep.components, node.id);
    if (component) {
      const duplicated = this.duplicateComponent(component);
      this.formBuilderService.addComponent(duplicated);
    }
  }

  onDeleteNode(node: TreeNode, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${node.label}"?`)) {
      this.formBuilderService.removeComponent(node.id);
    }
  }

  onAddChildNode(parentNode: TreeNode, event: Event): void {
    event.stopPropagation();
    
    // For now, add a simple input component as child
    const childComponent = this.formBuilderService.createComponent(ComponentType.INPUT, parentNode.id);
    childComponent.label = 'New Input';
    this.formBuilderService.addComponent(childComponent, undefined, parentNode.id);
    
    // Expand parent node
    this.expandedNodes.add(parentNode.id);
    this.buildTree();
  }

  getNodeIcon(node: TreeNode): string {
    const iconMap: Partial<{ [key in ComponentType]: string }> = {
      [ComponentType.INPUT]: 'bi-input-cursor-text',
      [ComponentType.TEXTAREA]: 'bi-textarea-resize',
      [ComponentType.SELECT]: 'bi-menu-button-wide',
      [ComponentType.CHECKBOX]: 'bi-check-square',
      [ComponentType.RADIO]: 'bi-record-circle',
      [ComponentType.DATE]: 'bi-calendar-date',
      [ComponentType.FILE]: 'bi-cloud-upload',
      [ComponentType.PANEL]: 'bi-layout-three-columns',
      [ComponentType.ACCORDION]: 'bi-list',
      [ComponentType.GRID]: 'bi-grid-3x3',
      [ComponentType.RICH_TEXT]: 'bi-fonts',
      [ComponentType.NUMBER]: 'bi-123',
      [ComponentType.EMAIL]: 'bi-envelope',
      [ComponentType.PASSWORD]: 'bi-key',
      [ComponentType.URL]: 'bi-link',
      [ComponentType.TEL]: 'bi-telephone',
      [ComponentType.COLUMNS]: 'bi-columns-gap',
      [ComponentType.DATAGRID]: 'bi-table'
    };

    return iconMap[node.type] || 'bi-square';
  }

  getNodeTypeColor(node: TreeNode): string {
    const colorMap: Partial<{ [key in ComponentType]: string }> = {
      [ComponentType.INPUT]: '#28a745',
      [ComponentType.TEXTAREA]: '#17a2b8',
      [ComponentType.SELECT]: '#ffc107',
      [ComponentType.CHECKBOX]: '#6f42c1',
      [ComponentType.RADIO]: '#6f42c1',
      [ComponentType.DATE]: '#fd7e14',
      [ComponentType.FILE]: '#20c997',
      [ComponentType.PANEL]: '#e83e8c',
      [ComponentType.ACCORDION]: '#6610f2',
      [ComponentType.GRID]: '#6c757d',
      [ComponentType.RICH_TEXT]: '#495057',
      [ComponentType.NUMBER]: '#007bff',
      [ComponentType.EMAIL]: '#007bff',
      [ComponentType.PASSWORD]: '#dc3545',
      [ComponentType.URL]: '#007bff',
      [ComponentType.TEL]: '#007bff'
    };

    return colorMap[node.type] || '#6c757d';
  }

  hasChildren(node: TreeNode): boolean {
    return Boolean(node.children && node.children.length > 0);
  }

  canHaveChildren(node: TreeNode): boolean {
    return [ComponentType.PANEL, ComponentType.ACCORDION].includes(node.type);
  }

  isNodeExpanded(node: TreeNode): boolean {
    return this.expandedNodes.has(node.id);
  }

  isNodeSelected(node: TreeNode): boolean {
    return this.state.selectedComponent?.id === node.id;
  }

  isNodeDragging(node: TreeNode): boolean {
    return this.draggedNode?.id === node.id;
  }

  isNodeDragOver(node: TreeNode): boolean {
    return this.dragOverNode?.id === node.id;
  }

  private isDescendant(potentialDescendant: TreeNode, ancestor: TreeNode): boolean {
    if (!ancestor.children) return false;

    for (const child of ancestor.children) {
      if (child.id === potentialDescendant.id) return true;
      if (this.isDescendant(potentialDescendant, child)) return true;
    }

    return false;
  }

  trackByNodeId(index: number, node: TreeNode): string {
    return node.id;
  }

  expandAll(): void {
    this.collectAllNodeIds(this.treeNodes).forEach(id => {
      this.expandedNodes.add(id);
    });
    this.buildTree();
  }

  collapseAll(): void {
    this.expandedNodes.clear();
    this.buildTree();
  }

  private collectAllNodeIds(nodes: TreeNode[]): string[] {
    const ids: string[] = [];
    for (const node of nodes) {
      ids.push(node.id);
      if (node.children) {
        ids.push(...this.collectAllNodeIds(node.children));
      }
    }
    return ids;
  }

  private moveNode(draggedNode: TreeNode, targetNode?: TreeNode): void {
    const currentStep = this.state.formSchema.steps.find(s => s.id === this.state.currentStep);
    if (!currentStep) return;

    // Find the component being dragged
    const draggedComponent = this.findComponentById(currentStep.components, draggedNode.id);
    if (!draggedComponent) {
      console.error('Dragged component not found:', {
        draggedNodeId: draggedNode.id,
        totalComponents: currentStep.components.length,
        allComponentIds: this.getAllComponentIds(currentStep.components)
      });
      return;
    }

    console.log('Found dragged component:', {
      id: draggedComponent.id,
      label: draggedComponent.label,
      parentId: draggedComponent.parentId,
      hasChildren: !!draggedComponent.children
    });

    // Store original position info before removal
    const originalParentId = draggedComponent.parentId;
    const originalIndex = this.getComponentIndex(currentStep.components, draggedComponent.id, originalParentId);

    console.log('Moving component:', {
      label: draggedNode.label,
      originalParentId,
      originalIndex,
      targetLabel: targetNode?.label || 'root'
    });

    // Create a deep copy of the component
    const componentCopy = this.deepCopyComponent(draggedComponent);

    // Determine the new parent and position BEFORE removing the component
    let newParentId: string | undefined = undefined;
    let insertIndex: number | undefined = undefined;

    if (targetNode && this.canHaveChildren(targetNode)) {
      // Drop inside container
      newParentId = targetNode.id;
      this.expandedNodes.add(targetNode.id);
    } else if (targetNode) {
      // Drop at same level as target node - calculate BEFORE removal
      const targetComponent = this.findComponentById(currentStep.components, targetNode.id);
      if (!targetComponent) {
        console.error('Target component not found:', targetNode.id);
        return;
      }

      newParentId = targetComponent.parentId;
      insertIndex = this.getComponentIndex(currentStep.components, targetNode.id, newParentId);

      console.log('Target component details:', {
        targetId: targetNode.id,
        targetLabel: targetNode.label,
        targetParentId: targetComponent.parentId,
        calculatedIndex: insertIndex
      });

      // Adjust index for same parent moves
      if (originalParentId === newParentId) {
        if (originalIndex < insertIndex) {
          // Moving down - insert after target becomes insert at target position
          insertIndex = insertIndex;
        } else {
          // Moving up - insert before target
          // No adjustment needed
        }
      } else {
        // Different parent - insert after target
        insertIndex = insertIndex + 1;
      }
    }

    // Remove the component from its current location
    this.formBuilderService.removeComponent(draggedNode.id);

    // Update the component's parent ID
    componentCopy.parentId = newParentId;

    // Wait for the removal to complete, then add the component
    setTimeout(() => {
      // Add the component to its new location with proper positioning
      if (insertIndex !== undefined && this.formBuilderService.addComponentAtIndex) {
        this.formBuilderService.addComponentAtIndex(componentCopy, insertIndex, newParentId);
      } else {
        this.formBuilderService.addComponent(componentCopy, undefined, newParentId);
      }

      console.log('Moved node successfully:', {
        from: { parentId: originalParentId, index: originalIndex },
        to: { parentId: newParentId, index: insertIndex }
      });
    }, 10);
  }

  private getComponentIndex(components: FormComponent[], componentId: string, parentId?: string): number {
    let targetComponents: FormComponent[];

    if (parentId) {
      // Find components within the parent (could be nested)
      const parent = this.findComponentById(components, parentId);
      targetComponents = parent?.children || [];
    } else {
      // Root level components (no parentId)
      targetComponents = this.getRootComponents(components);
    }

    const index = targetComponents.findIndex(c => c.id === componentId);
    console.log('getComponentIndex:', {
      componentId,
      parentId,
      targetComponentsCount: targetComponents.length,
      foundIndex: index,
      targetComponentIds: targetComponents.map(c => c.id),
      parentFound: parentId ? !!this.findComponentById(components, parentId) : 'root'
    });

    return index;
  }

  private getRootComponents(components: FormComponent[]): FormComponent[] {
    // Only return components that have no parentId or parentId is null/undefined
    return components.filter(c => !c.parentId);
  }

  private deepCopyComponent(component: FormComponent): FormComponent {
    return {
      ...component,
      id: component.id, // Keep the same ID
      properties: { ...component.properties },
      validation: component.validation ? [...component.validation] : undefined,
      children: component.children ? component.children.map(child => this.deepCopyComponent(child)) : undefined
    };
  }

  private findComponentById(components: FormComponent[], id: string): FormComponent | null {
    for (const component of components) {
      if (component.id === id) {
        return component;
      }
      if (component.children) {
        const found = this.findComponentById(component.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private duplicateComponent(component: FormComponent): FormComponent {
    const newComponent = this.formBuilderService.createComponent(component.type, component.parentId);

    return {
      ...newComponent,
      label: component.label + ' (Copy)',
      placeholder: component.placeholder,
      required: component.required,
      value: component.value,
      validation: component.validation ? [...component.validation] : undefined,
      properties: { ...component.properties },
      children: component.children ? component.children.map(child => this.duplicateComponent(child)) : undefined
    };
  }

  private getAllComponentIds(components: FormComponent[]): string[] {
    const ids: string[] = [];

    const collectIds = (comps: FormComponent[]) => {
      comps.forEach(comp => {
        ids.push(comp.id);
        if (comp.children) {
          collectIds(comp.children);
        }
      });
    };

    collectIds(components);
    return ids;
  }

  // Filter methods
  applyFilters(): void {
    if (!this.hasActiveFilters()) {
      this.filteredTreeNodes = this.treeNodes;
      return;
    }

    const filteredComponents = this.filterComponents(this.allComponents);
    this.filteredTreeNodes = this.buildTreeNodes(filteredComponents);
  }

  private filterComponents(components: FormComponent[]): FormComponent[] {
    const result: FormComponent[] = [];

    for (const component of components) {
      let includeComponent = false;

      // Check required filters
      if (this.filterRequiredTrue && component.required === true) {
        includeComponent = true;
      }
      if (this.filterRequiredFalse && component.required === false) {
        includeComponent = true;
      }

      // Check conditional logic filters
      if (component.properties?.conditional) {
        const conditional = component.properties.conditional;

        if (this.filterConditionalShow && conditional.show === 'true') {
          includeComponent = true;
        }
        if (this.filterConditionalHide && conditional.show === 'false') {
          includeComponent = true;
        }
      }

      // If component matches filter, include it
      if (includeComponent) {
        const componentCopy = { ...component };

        // Recursively filter children
        if (component.children && component.children.length > 0) {
          componentCopy.children = this.filterComponents(component.children);
        }

        result.push(componentCopy);
      } else {
        // If component doesn't match, but has children that might match, check children
        if (component.children && component.children.length > 0) {
          const filteredChildren = this.filterComponents(component.children);
          if (filteredChildren.length > 0) {
            const componentCopy = { ...component };
            componentCopy.children = filteredChildren;
            result.push(componentCopy);
          }
        }
      }
    }

    return result;
  }

  hasActiveFilters(): boolean {
    return this.filterRequiredTrue ||
           this.filterRequiredFalse ||
           this.filterConditionalShow ||
           this.filterConditionalHide;
  }

  clearAllFilters(): void {
    this.filterRequiredTrue = false;
    this.filterRequiredFalse = false;
    this.filterConditionalShow = false;
    this.filterConditionalHide = false;
    this.applyFilters();
  }

  getFilteredComponentsCount(): number {
    return this.countFilteredComponents(this.filteredTreeNodes);
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filterRequiredTrue) count++;
    if (this.filterRequiredFalse) count++;
    if (this.filterConditionalShow) count++;
    if (this.filterConditionalHide) count++;
    return count;
  }

  toggleFiltersAccordion(): void {
    this.filtersAccordionExpanded = !this.filtersAccordionExpanded;
  }

  private countFilteredComponents(nodes: TreeNode[]): number {
    let count = 0;
    for (const node of nodes) {
      count++;
      if (node.children) {
        count += this.countFilteredComponents(node.children);
      }
    }
    return count;
  }
}
