import { Injectable } from '@angular/core';
import { FormBuilderService } from './form-builder.service';
import { ValidationService } from './validation.service';
import { FormComponent, FormStep, ComponentType, ConditionalLogic } from '../models/form-builder.models';

interface NumberingContext {
  stepIndex: number;
  componentNumbers: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly GLOBAL_ANALYSIS_ID = '__analysis__';

  constructor(private formBuilderService: FormBuilderService, private validationService: ValidationService) { }

  generateHTMLReport(): string {
    const state = this.formBuilderService.getCurrentState();
    const formSchema = state.formSchema;

    const visibleSteps = formSchema.steps.filter(step => this.shouldIncludeStep(step));
    const summary = this.generateSummary(visibleSteps);

    const content = visibleSteps.map((step, stepIndex) => {
      const context: NumberingContext = { stepIndex: stepIndex + 1, componentNumbers: [] };
      return this.generateStepContent(step, context);
    }).join('\n');

    return this.generateFullHTML(formSchema.name || 'Formulário', summary, content);
  }

  generateHTMLReportFull(): string {
    const state = this.formBuilderService.getCurrentState();
    const formSchema = state.formSchema;

    // Include ALL steps without any filtering
    const allSteps = formSchema.steps;
    const summary = this.generateSummary(allSteps);

    const content = allSteps.map((step, stepIndex) => {
      const context: NumberingContext = { stepIndex: stepIndex + 1, componentNumbers: [] };
      return this.generateStepContentFullStructure(step, context);
    }).join('\n');

    return this.generateFullHTML(formSchema.name || 'Formulário', summary, content);
  }

  generateHTMLReportWithAnnotations(mode: 'full' | 'summary'): string {
    const state = this.formBuilderService.getCurrentState();
    const formSchema = state.formSchema;

    const stepsBase = formSchema.steps.filter(step => this.shouldIncludeStep(step));
    const visibleSteps = mode === 'summary' ? this.filterStepsWithAnnotations(stepsBase) : stepsBase;

    const summary = this.generateSummary(visibleSteps);

    const topAnnotationsHtml = this.generateGlobalAnnotationsSection();

    const content = visibleSteps.map((step, stepIndex) => {
      const context: NumberingContext = { stepIndex: stepIndex + 1, componentNumbers: [] };
      return this.generateStepContent(step, context, mode);
    }).join('\n');

    const finalContent = topAnnotationsHtml + (topAnnotationsHtml ? '\n' : '') + content;
    return this.generateFullHTML(formSchema.name || 'Formulário', summary, finalContent);
  }

  private filterStepsWithAnnotations(steps: FormStep[]): FormStep[] {
    return steps.filter(step => this.stepHasAnnotatedItems(step));
  }

  private stepHasAnnotatedItems(step: FormStep): boolean {
    return step.components.some(c => this.componentHasAnnotationsDeep(c));
  }

  private componentHasAnnotationsDeep(component: FormComponent): boolean {
    if (this.getAnnotationsForComponent(component.id).length > 0) return true;
    if (this.isContainerComponent(component) && component.children && component.children.length) {
      return component.children.some(child => this.componentHasAnnotationsDeep(child));
    }
    return false;
  }

  private generateSummary(steps: FormStep[]): string {
    const summaryItems = steps.map((step, index) => {
      const stepNumber = index + 1;
      return `    <li><a href="#section-${stepNumber}">${stepNumber} - ${step.title}</a></li>`;
    }).join('\n');

    return `  <div class="summary">
   <h2>Sumário</h2>
   <ul class="summary">
${summaryItems}
   </ul>
  </div>`;
  }

  private generateStepContent(step: FormStep, context: NumberingContext, mode: 'full' | 'summary' = 'full'): string {
    const stepNumber = context.stepIndex;

    context.componentNumbers = [0];

    const stepHeader = `  <section class="capitulo outer-section" id="${stepNumber}">
   <div class="outer-header" id="section-${stepNumber}">
     ${stepNumber} - ${step.title}
   </div>
  </section>`;

    const componentsContent = step.components.map(component => {
      return this.generateComponentContent(component, context, 0, mode);
    }).filter(c => c && c.trim() !== '').join('\n');

    if (mode === 'summary' && !componentsContent.trim()) return '';
    return stepHeader + '\n' + componentsContent;
  }

  private generateStepContentFullStructure(step: FormStep, context: NumberingContext): string {
    const stepNumber = context.stepIndex;

    context.componentNumbers = [0];

    const stepHeader = `  <section class="capitulo outer-section" id="${stepNumber}">
   <div class="outer-header" id="section-${stepNumber}">
     ${stepNumber} - ${step.title}
   </div>
  </section>`;

    const componentsContent = step.components.map(component => {
      return this.generateComponentStructure(component, context, 0);
    }).filter(c => c && c.trim() !== '').join('\n');

    return stepHeader + '\n' + componentsContent;
  }

  private generateComponentContent(component: FormComponent, context: NumberingContext, depth: number, mode: 'full' | 'summary' = 'full'): string {
    if (!this.shouldIncludeComponent(component)) {
      return '';
    }

    if (mode === 'summary' && !this.componentHasAnnotationsDeep(component)) {
      return '';
    }

    if (component.properties?.hideLabel) {
      // If hideLabel=true and is a container, recursively render its children
      // (they will be accumulated into the first visible parent)
      if (this.isContainerComponent(component) && component.children && component.children.length > 0) {
        return component.children
          .map(child => this.generateComponentContent(child, context, depth, mode))
          .filter(content => content.trim() !== '')
          .join('\n');
      }
      // If hideLabel=true and not a container, skip it completely
      return '';
    }

    if (context.componentNumbers.length <= depth) {
      context.componentNumbers.push(1);
    } else {
      context.componentNumbers[depth]++;
      context.componentNumbers = context.componentNumbers.slice(0, depth + 1);
    }

    const currentNumber = this.getComponentNumber(context, depth);
    const numberedLabel = `${currentNumber} - ${component.label || this.getComponentTypeLabel(component.type)}`;
    let componentValue = this.getComponentDisplayValue(component);

    // Accumulate values from direct children with hideLabel=true
    // This applies to both containers (panels) and leaf components
    const hiddenChildrenValues = this.collectHiddenLabelChildrenValues(component);
    if (hiddenChildrenValues.length > 0) {
      const allValues = [componentValue, ...hiddenChildrenValues].filter(v => v && v.trim() !== '');
      componentValue = allValues.join(' - ');
    }

    let html = '';

    if (this.isContainerComponent(component)) {
      // For containers, show the panel label with any accumulated hidden children values
      const separator = componentValue && componentValue.trim() ? ': ' : '';
      const valueHtml = componentValue ? `<span class="conteudo">${componentValue}</span>` : '';

      html += `  <article class="inner-section small-number" id="${currentNumber.replace(/\s/g, '')}">
    ${numberedLabel}${separator}${valueHtml}
  </article>\n`;

      // Then render visible children as sub-items
      if (component.children && component.children.length > 0) {
        const childrenContent = component.children.map(child => {
          return this.generateComponentContent(child, context, depth + 1, mode);
        }).filter(content => content.trim() !== '').join('\n');

        html += childrenContent;
      }
    } else if (component.type === ComponentType.DATAGRID) {
      html += this.generateDataGridContent(component, currentNumber, numberedLabel);
      html += this.generateAnnotationsBlock(component.id);
    } else {
      // For leaf components, add value with colon separator (if no colon already in label)
      const separator = numberedLabel.trim().endsWith(':') ? ' ' : ': ';
      const valueHtml = componentValue ? `<span class="conteudo">${componentValue}</span>` : '<span class="conteudo"></span>';

      html += `  <article class="inner-section small-number" id="${currentNumber.replace(/\s/g, '')}">
    ${numberedLabel}${separator}${valueHtml}
  </article>`;
      html += this.generateAnnotationsBlock(component.id);
    }

    return html;
  }

  private generateComponentStructure(component: FormComponent, context: NumberingContext, depth: number): string {
    // Full structure report: show component labels/structure in JSON order
    // - No data values
    // - No accumulation of hideLabel components
    // - No filtering or special processing
    // - Just list in the exact order they appear in JSON

    if (context.componentNumbers.length <= depth) {
      context.componentNumbers.push(1);
    } else {
      context.componentNumbers[depth]++;
      context.componentNumbers = context.componentNumbers.slice(0, depth + 1);
    }

    const currentNumber = this.getComponentNumber(context, depth);
    const componentLabel = component.label || this.getComponentTypeLabel(component.type);
    const numberedLabel = `${currentNumber} - ${componentLabel}`;

    let html = '';

    // Always render the component label (regardless of type or hideLabel)
    html += `  <article class="inner-section small-number" id="${currentNumber.replace(/\s/g, '')}">
    ${numberedLabel}
  </article>\n`;

    // If component has children, render them recursively in JSON order
    if (component.children && component.children.length > 0) {
      const childrenContent = component.children.map(child => {
        return this.generateComponentStructure(child, context, depth + 1);
      }).filter(content => content.trim() !== '').join('\n');

      html += childrenContent;
    }

    return html;
  }

  private generateDataGridContent(component: FormComponent, currentNumber: string, numberedLabel: string): string {
    let html = `  <article class="inner-section small-number" id="${currentNumber.replace(/\s/g, '')}">
    ${numberedLabel}`;

    if (component.rows && component.rows.length > 0) {
      html += `: <span class="conteudo">
    <table style=\"margin-left: 40px max-width: 650px !important;\" border=\"0\">
     <tbody>`;

      component.rows.forEach((row) => {
        const rowData = row.data || {};
        const rowValues = Object.values(rowData).filter(val => val !== undefined && val !== null && val !== '');
        if (rowValues.length > 0) {
          html += `
      <tr>
       <td>${rowValues.join(' | ')}</td>
      </tr>`;
        }
      });

      html += `
     </tbody>
    </table></span>`;
    } else {
      html += ': <span class="conteudo"></span>';
    }

    html += `
  </article>`;

    return html;
  }

  private generateAnnotationsBlock(componentId: string): string {
    const ann = this.getAnnotationsForComponent(componentId).filter(a => !a.parentId);
    if (!ann.length) return '';

    const items = ann.map((a, idx) => `
  <div style=\"margin:6px 0; padding:6px; border:1px solid #bfbfbf;\">
    <div>
      <span style=\"background:#0f223f;color:#fff;padding:2px 6px;\">${a.type}</span>
      ${a.responseType ? `<span style=\\\"background:#17a2b8;color:#fff;padding:2px 6px;margin-left:4px;\\\">${a.responseType}</span>` : ''}
      ${a.status ? `<span style=\\\"background:#6c757d;color:#fff;padding:2px 6px;margin-left:4px;\\\">${a.status}</span>` : ''}
      ${a.internalNote ? `<span style=\\\"background:yellow;color:#000;padding:2px 6px;margin-left:4px;\\\">Nota Interna</span>` : ''}
      <small style=\"color:#6c757d;margin-left:4px;\">#${idx + 1}</small>
    </div>
    <div class=\"conteudo\" style=\"margin-top:4px;\">${a.content || ''}</div>
  </div>`).join('');

    return `
  <div style=\"border-left:1px solid #bfbfbf;border-right:1px solid #bfbfbf;border-bottom:1px solid #bfbfbf;padding:6px;\">
    <div style=\"font-weight:bold;\">Apontamentos e notas (${ann.length})</div>
    ${items}
  </div>`;
  }

  private generateGlobalAnnotationsSection(): string {
    const ann = this.getAnnotationsForComponent(this.GLOBAL_ANALYSIS_ID).filter(a => !a.parentId);
    if (!ann.length) return '';

    const items = ann.map((a, idx) => `
  <div style=\"margin:6px 0; padding:6px; border:1px solid #bfbfbf;\">
    <div>
      <span style=\"background:#0f223f;color:#fff;padding:2px 6px;\">${a.type}</span>
      ${a.responseType ? `<span style=\\\"background:#17a2b8;color:#fff;padding:2px 6px;margin-left:4px;\\\">${a.responseType}</span>` : ''}
      ${a.status ? `<span style=\\\"background:#6c757d;color:#fff;padding:2px 6px;margin-left:4px;\\\">${a.status}</span>` : ''}
      ${a.internalNote ? `<span style=\\\"background:yellow;color:#000;padding:2px 6px;margin-left:4px;\\\">Nota Interna</span>` : ''}
      <small style=\"color:#6c757d;margin-left:4px;\">#${idx + 1}</small>
    </div>
    <div class=\"conteudo\" style=\"margin-top:4px;\">${a.content || ''}</div>
  </div>`).join('');

    return `
  <section class=\"capitulo outer-section\">
    <div class=\"outer-header\">Análise (geral)</div>
  </section>
  <div class=\"inner-section\">
    <div style=\"font-weight:bold;\">Apontamentos e notas (${ann.length})</div>
    ${items}
  </div>`;
  }

  private getComponentNumber(context: NumberingContext, depth: number): string {
    const stepNumber = context.stepIndex;
    const componentParts = context.componentNumbers.slice(0, depth + 1);

    if (depth === 0) {
      return `${stepNumber}.${componentParts[0]}`;
    } else {
      return `${stepNumber}.${componentParts.join('.')}`;
    }
  }

  private shouldIncludeComponent(component: FormComponent): boolean {
    if (component.type === ComponentType.TEXT_HELP) {
      return false;
    }

    if (!this.validationService.isComponentValidatable(component, this.formBuilderService)) {
      return false;
    }

    return true;
  }

  private isContainerComponent(component: FormComponent): boolean {
    return [ComponentType.PANEL, ComponentType.COLUMNS].includes(component.type);
  }

  private shouldIncludeStep(step: FormStep): boolean {
    if (step.properties?.invisible) {
      return false;
    }
    // Include all steps regardless of conditional logic
    // Conditional logic is for the live form UI, not for reports
    return true;
  }

  private evaluateStepConditional(conditional: ConditionalLogic): boolean {
    if (!conditional.when) return true;

    let watchedIds: string[] = [];
    if (Array.isArray(conditional.when)) {
      watchedIds = conditional.when.filter((id: any) => id && String(id).trim());
    } else if (conditional.when && String(conditional.when).trim()) {
      watchedIds = [String(conditional.when).trim()];
    }
    if (watchedIds.length === 0) return true;

    const primaryId = watchedIds[0];
    const componentValue = String(this.formBuilderService.getComponentValueById(primaryId));

    const expectedValues = Array.isArray((conditional as any).eq)
      ? (conditional as any).eq.map((v: any) => String(v))
      : [String(conditional.eq)];

    const actualValues = componentValue.includes(',')
      ? componentValue.split(',').map(v => v.trim())
      : [componentValue];

    const conditionMet = actualValues.some(v => expectedValues.includes(v));
    const show = typeof conditional.show === 'string' ? (conditional.show === 'true') : !!conditional.show;
    return show ? conditionMet : !conditionMet;
  }

  /**
   * Collects display values from direct children with hideLabel = true
   * These values will be accumulated into the parent component's value
   * For container children with hideLabel=true, collects their nested values (both visible and hidden)
   */
  private collectHiddenLabelChildrenValues(component: FormComponent): string[] {
    const values: string[] = [];

    if (!component.children || component.children.length === 0) {
      return values;
    }

    for (const child of component.children) {
      if (child.properties?.hideLabel) {
        // If the hidden child is a container, collect all its nested values
        if (this.isContainerComponent(child)) {
          const nestedValues = this.collectAllComponentValuesInContainer(child);
          values.push(...nestedValues);
        } else {
          // For non-container components, get their display value
          const childValue = this.getComponentDisplayValue(child);
          if (childValue && childValue.trim() !== '') {
            values.push(childValue);
          }
        }
      }
    }

    return values;
  }

  /**
   * Recursively collects display values from all components within a container
   * Includes both visible (hideLabel=false) and hidden (hideLabel=true) leaf components
   * Skips nested containers with hideLabel=true as their children will be processed separately
   */
  private collectAllComponentValuesInContainer(component: FormComponent): string[] {
    const values: string[] = [];

    if (!component.children || component.children.length === 0) {
      // If container has no children, get container's own value if it's not a pure container
      if (!this.isContainerComponent(component)) {
        const value = this.getComponentDisplayValue(component);
        if (value && value.trim() !== '') {
          values.push(value);
        }
      }
      return values;
    }

    for (const child of component.children) {
      // Skip children with hideLabel=true that are containers (they handle their own children)
      if (child.properties?.hideLabel && this.isContainerComponent(child)) {
        continue;
      }

      if (this.isContainerComponent(child)) {
        // For visible containers, recursively collect from their children
        const nestedValues = this.collectAllComponentValuesInContainer(child);
        values.push(...nestedValues);
      } else {
        // For leaf components (visible or hidden), get their value
        const childValue = this.getComponentDisplayValue(child);
        if (childValue && childValue.trim() !== '') {
          values.push(childValue);
        }
      }
    }

    return values;
  }

  /**
   * Renders a template string by replacing {fieldName} placeholders with values from data object
   * Example: renderTemplate('{chave} - {descricao}', {chave: 'ABC', descricao: 'Test'}) -> 'ABC - Test'
   */
  private renderTemplate(template: string, data: any): string {
    return template.replace(/\{([^}]+)\}/g, (match, fieldName) => {
      const value = this.getNestedProperty(data, fieldName.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Gets a nested property from an object using dot notation
   * Example: getNestedProperty({a: {b: 'value'}}, 'a.b') -> 'value'
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private getComponentTypeLabel(type: ComponentType): string {
    const typeLabels: { [key: string]: string } = {
      [ComponentType.INPUT]: 'Campo de Texto',
      [ComponentType.PROCESSO_SEI]: 'Processo SEI',
      [ComponentType.NUMERO_ETP]: 'Número ETP',
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
      [ComponentType.SELECT_API]: 'Seleção API',     
       [ComponentType.UNIDADE]: 'Seleção Unidade API',
        [ComponentType.SERVIDOR]: 'Seleção Servidor API', 
      [ComponentType.TIPO_CONTRATACAO]: 'Tipo de Contratação'
    };

    return typeLabels[type] || type;
  }

  private getComponentDisplayValue(component: FormComponent): string {
    const value = component.value;
    if (value === undefined || value === null) {
      return '';
    }

    switch (component.type) {
      case ComponentType.SELECT:
      case ComponentType.RADIO: {
        const v = Array.isArray(value) ? value[0] : value;
        if (component.properties?.options) {
          const selectedOption = component.properties.options.find(opt => opt.value == v);
          return selectedOption ? selectedOption.label : String(v);
        }
        return String(v);
      }

      case ComponentType.SELECT_BOX: {
        if (component.properties?.multiple && Array.isArray(value)) {
          if (component.properties.options) {
            const selectedLabels = value.map(val => {
              const option = component.properties.options!.find(opt => opt.value == val);
              return option ? option.label : String(val);
            });
            return selectedLabels.join(', ');
          }
          return value.map(v => String(v)).join(', ');
        } else {
          const v = Array.isArray(value) ? value[0] : value;
          if (component.properties?.options) {
            const selectedOption = component.properties.options.find(opt => opt.value == v);
            return selectedOption ? selectedOption.label : String(v);
          }
          return String(v);
        }
      }

  case ComponentType.SELECT_API:
  case ComponentType.TIPO_CONTRATACAO:
  case ComponentType.UNIDADE:
    case ComponentType.SERVIDOR:

  {
        const labelFrom = (val: any): string => {
          const cfg = component.properties?.apiConfig || {};
          const labelKey = cfg.labelField || 'label';
          const valueKey = cfg.valueField || 'value';
          const labelTemplate = cfg.labelTemplate;

          if (val && typeof val === 'object') {
            // If labelTemplate is provided, apply it
            if (labelTemplate) {
              return this.renderTemplate(labelTemplate, val);
            }
            // Otherwise extract from labelKey or fallback fields
            return (
              val[labelKey] ?? val.label ?? val.name ?? val.descricao ?? val.text ?? val.title ?? val[valueKey] ?? ''
            ).toString();
          }

          const opt = component.properties?.options?.find((o: any) => o.value == val);
          return (opt?.label ?? String(val));
        };

        if (component.properties?.multiple) {
          const arr = Array.isArray(value) ? value : [value];
          return arr.map(v => labelFrom(v)).filter(Boolean).join(', ');
        } else {
          return labelFrom(value);
        }
      }

      case ComponentType.CHECKBOX: {
        if (component.properties?.options && component.properties.options.length > 0) {
          const selectedOptions = component.properties.options.filter((opt: any) => opt.selected);
          return selectedOptions.map((opt: any) => opt.label).join(', ');
        }
        return value ? 'Sim' : 'Não';
      }

      case ComponentType.FILE: {
        if (Array.isArray(value)) {
          return value.map((file: any) => (file?.name ?? String(file))).join(', ');
        }
        return value?.name ? String(value.name) : String(value);
      }

      case ComponentType.DATE: {
        const d = new Date(value);
        return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('pt-BR');
      }

      case ComponentType.RICH_TEXT: {
        const str = typeof value === 'string' ? value : String(value);
        return str;
      }

      default:
        return typeof value === 'string' ? value : String(value);
    }
  }

  private generateFullHTML(title: string, summary: string, content: string): string {
    return `<html>
 <head>
  <style>
        body {
            margin-left: 10px !important;
            margin-right: 10px !important;
            line-height: 1.2;
            font-family: Arial, Helvetica, Verdana, Tahoma, sans-serif;
            font-size: 12pt;
        }

        @media print {
            table {
                max-width: 95%;
            }
        }

        table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 95%;
            height: auto;
            border: 1px double #b3b3b3;
        }

        tr {
            display: table-row;
            vertical-align: inherit;
            unicode-bidi: isolate;
        }

        td, th {
            display: table-cell;
            min-width: 2em;
            padding: .4em;
            border: 1px solid #bfbfbf;
        }

        @page {
            size: 297mm 297mm; /* Ensures portrait layout */
            margin: 10mm; /* Adjusts margins */
        }

        img {
            padding: 0px !important;
            margin: 0px !important;
            max-width: 900px !important; /* Max width for A3 landscape */
        }

        figure {
            padding: 0px !important;
            margin: 0px !important;
            max-width: 900px !important; /* Max width for A3 landscape */
        }

        .capitulo {
            font-weight: bold !important;
        }

        .subCapitulo {
            font-weight: bold !important;
        }

        .conteudo {
            font-weight: normal !important;
        }

        .outer-section {
            border: none;
            padding: 0px;
            margin: 0px;
            background-color: #f9f9f9;
        }

        .outer-header {
            border-top: 1px solid black;
            border-left: 1px solid black;
            border-right: 1px solid black;
            background-color: #0f223f;
            color: white;
            padding: 10px;
            margin: 0px 0;
        }

        .inner-section {
            border-top: 1px solid black;
            border-left: 1px solid black;
            border-right: 1px solid black;
            font-weight: bold;
            padding: 10px;
            margin: 0px 0;
            background-color: inherit;
        }

        .inner-section:empty {
            border-left: none !important;
            border-right: none !important;
        }

        h2, h3 {
            margin: 0;
        }

        p {
            margin: 0 0 10px;
        }

        .summary {

        }

        .summary h2 {
            margin-top: 0;
            border: 1px solid black;
            background-color: #0f223f;
            color: white;
            padding: 10px;
            margin: 0px 0;
        }

        .summary ul {
            list-style: none; /* Remove os marcadores padrão */
            padding: 5px;
            margin: 0;
            border-left: 1px solid black;
            border-right: 1px solid black;
        }

        .summary li {
            margin-left: 10px;
            padding: 2px;
            display: block;
        }

        .summary a {
            text-decoration: none; /* Remove o sublinhado dos links */
            color: #0f223f; /* Azul moderno #0f223f */
            font-weight: bold;
            font-size: 16px;
            transition: color 0.3s ease-in-out; /* Animação de cor ao passar o mouse */
        }

        .summary a:hover {
            color: #0056b3; /* Azul mais escuro no hover */
        }

        .outer-header-yellow {
            border: none;
            border-bottom: none;
            border-left: 1px solid black;
            border-right: 1px solid black;
            background-color: yellow !important;
            color: black;
            padding: none;
            margin: 0px 0;
            min-width: 760px;
            max-width: 760px
        }

        .outer-header-red {
            border: none;
            border-bottom: none;
            border-left: 1px solid black;
            border-right: 1px solid black;
            background-color: red !important;
            color: black;
            padding: none;
            margin: 0px 0;
            text-decoration: line-through;
            min-width: 760px;
            max-width: 760px
        }

        .outer-header-transparent {
            border: 1px solid black;
            border-bottom: none;
            border-left: 1px solid black;
            border-right: 1px solid black;
            background-color: transparent !important;
            color: black;
            min-width: 760px;
            max-width: 760px
        }

        .bordaBottom {
            border-top: 1px solid black;
            border-bottom: none;
            background-color: transparent !important;
            color: black;
            width: auto;
        }

        .formio-notainterna {
            background-color: lightyellow !important;
            border: 2px solid yellow !important;
            padding: 10px !important;
            margin: 9px !important;
            border-radius: 7px !important;
            text-align: left !important;
        }

        .formio-textoajuda {
            background-color: lightblue !important;
            border: 2px solid blue !important;
            padding: 10px !important;
            margin: 9px !important;
            border-radius: 7px !important;
            text-align: left !important;
        }
    </style>
 </head>
 <body>
  <h3 class="titulo-documento" style="padding: 5px; text-align: center; font-family: Arial, sans-serif;">${title}</h3>
${summary}
${content}
 </body>
</html>`;
  }

  private getAnnotationsForComponent(componentId: string): any[] {
    return this.formBuilderService.getAnnotationsForComponent(componentId) || [];
  }
}
