import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilderService } from '../../services/form-builder.service';
import { ComponentTemplate, ComponentCategory, ComponentType } from '../../models/form-builder.models';

@Component({
  selector: 'app-component-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './component-palette.component.html',
  styleUrls: ['./component-palette.component.scss']
})
export class ComponentPaletteComponent implements OnInit, OnDestroy {
  componentTemplates: ComponentTemplate[] = [];
  searchTerm: string = '';
  isDragging: boolean = false;
  clickTimeout: any = null;

  // Accordion state management
  accordionState: { [key: string]: boolean } = {
    'basic': true,
    'layout': false,
    'data': false,
    'custom': false
  };

  constructor(private formBuilderService: FormBuilderService) {}

  ngOnInit(): void {
    this.componentTemplates = this.formBuilderService.getComponentTemplates();
  }

  ngOnDestroy(): void {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
  }

  onSearchChange(): void {
    // Search functionality is now handled in the template with getFilteredComponentsByCategory
  }

  onDragStart(event: DragEvent, template: ComponentTemplate): void {
    this.isDragging = true;
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify({
        componentType: template.type,
        source: 'palette'
      }));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onDragEnd(): void {
    // Reset dragging state after a longer delay to ensure all events are processed
    setTimeout(() => {
      this.isDragging = false;
    }, 500);
  }

  onComponentClick(event: Event, template: ComponentTemplate): void {
    // Prevent click if dragging or if this was triggered by a drag operation
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Prevent multiple rapid clicks
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    this.clickTimeout = setTimeout(() => {
      // Alternative to drag and drop - direct add to current step
      const component = this.formBuilderService.createComponent(template.type);
      this.formBuilderService.addComponent(component);
      this.clickTimeout = null;
    }, 50);
  }

  getIconClass(template: ComponentTemplate): string {
    const iconMap: Partial<{ [key in ComponentType]: string }> = {
      [ComponentType.INPUT]: 'bi-input-cursor-text',
      [ComponentType.TEXTAREA]: 'bi-textarea-resize',
      [ComponentType.SELECT]: 'bi-menu-button-wide',
      [ComponentType.SELECT_BOX]: 'bi-ui-checks',
      [ComponentType.SELECT_API]: 'bi-cloud-download',
      [ComponentType.CHECKBOX]: 'bi-check-square',
      [ComponentType.RADIO]: 'bi-record-circle',
      [ComponentType.DATE]: 'bi-calendar-date',
      [ComponentType.FILE]: 'bi-cloud-upload',
      [ComponentType.PANEL]: 'bi-layout-three-columns',
      [ComponentType.ACCORDION]: 'bi-list',
      [ComponentType.GRID]: 'bi-grid-3x3',
      [ComponentType.RICH_TEXT]: 'bi-text-paragraph',
      [ComponentType.NUMBER]: 'bi-123',
      [ComponentType.EMAIL]: 'bi-envelope',
      [ComponentType.PASSWORD]: 'bi-key',
      [ComponentType.URL]: 'bi-link',
      [ComponentType.TEL]: 'bi-telephone',
      [ComponentType.COLUMNS]: 'bi-columns-gap',
      [ComponentType.DATAGRID]: 'bi-table'
    };

    return iconMap[template.type] || 'bi-square';
  }

  trackByType(index: number, template: ComponentTemplate): ComponentType {
    return template.type;
  }

  addMostUsed(): void {
    // Add commonly used components
    const mostUsedTypes = [ComponentType.INPUT, ComponentType.TEXTAREA, ComponentType.SELECT];
    mostUsedTypes.forEach(type => {
      const component = this.formBuilderService.createComponent(type);
      this.formBuilderService.addComponent(component);
    });
  }

  addFormTemplate(): void {
    // Add a basic contact form template
    const templateComponents = [
      { type: ComponentType.INPUT, label: 'Full Name' },
      { type: ComponentType.EMAIL, label: 'Email Address' },
      { type: ComponentType.TEL, label: 'Phone Number' },
      { type: ComponentType.TEXTAREA, label: 'Message' }
    ];

    templateComponents.forEach(config => {
      const component = this.formBuilderService.createComponent(config.type);
      component.label = config.label;
      this.formBuilderService.addComponent(component);
    });
  }

  getComponentsByCategory(category: string): ComponentTemplate[] {
    return this.componentTemplates.filter(template => template.category === category);
  }

  getFilteredComponentsByCategory(category: string): ComponentTemplate[] {
    let filtered = this.getComponentsByCategory(category);

    // Filter by search term if there's one
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.label.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  getFilteredComponents(): ComponentTemplate[] {
    let filtered = this.componentTemplates;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.label.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  toggleAccordion(category: string): void {
    this.accordionState[category] = !this.accordionState[category];
  }

  isAccordionOpen(category: string): boolean {
    return this.accordionState[category] || false;
  }

}
