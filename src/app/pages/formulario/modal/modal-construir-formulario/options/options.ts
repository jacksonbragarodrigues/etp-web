import traducaoPt from './traducaoPtBr';
import editFormCustom from './editFormCustom';
import builderCustom from './builderCustom';

export const optionsPtBr = {
  readOnly: false,
  somenteLeitura: false,
  builder: builderCustom,
  language: 'pt',
  i18n: {
    pt: traducaoPt,
  },
  alerts: {
    submitMessage: 'Envio Completo', // Garante que a mensagem de submissão completa seja personalizada
  },
  styles: {
    buttonGroup: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  editForm: editFormCustom,
  templates: {
    panel: {
      // foi alterado {% if (!ctx.collapsed || ctx.builder) { %} para {% if (!ctx.collapsed) { %}
      form: `
                    <div class="mb-2 card border">
                      {% if (!ctx.component.hideLabel || ctx.builder || ctx.component.collapsible || ctx.component.tooltip) { %}
                      <div
                      class="card-header {{ ctx.transform('class', 'bg-' + ctx.component.theme) }}"
                      {% if (ctx.component.collapsible) { %} tabindex="0" {% } %}
                      role="button"
                      aria-expanded="{{ ctx.component.collapsible ? !ctx.collapsed : true }}"
                      aria-controls="{{ ctx.instance.id }}-{{ ctx.component.key }}"
                      ref="header"
                      >
                      <span style="font-weight: bold;" class="mb-0 card-title {% if (ctx.component.theme && ctx.component.theme !== 'default') { %} text-light {% } %}">
                      {% if (ctx.component.collapsible) { %}
                      <i
                          class="formio-collapse-icon {{ ctx.iconClass(ctx.collapsed ? 'plus-square-o' : 'minus-square-o') }} text-muted"
                          data-title="Collapse Panel">
                      </i>
                      {% } %}

                      {% if (!ctx.component.hideLabel || ctx.builder) { %}

                      {{ ctx.t(ctx.component.title, { _userInput: true }) }}
{% if (ctx.component.filled) { %}
  <i class="fa fa-check text-success"></i>
{% } else { %}
  <i class="fa fa-times text-danger"></i>
{% } %}

                      {% } %}
                      {% if (ctx.component.tooltip) { %}
                      <i
                          ref="tooltip"
                          tabindex="0"
                          class="{{ ctx.iconClass('question-sign') }} text-muted"
                          data-tooltip="{{ ctx.component.tooltip }}">
                      </i>
                      {% } %}
                      </span>
                    </div>
                    {% } %}

                    {% if (!ctx.collapsed) { %}
                    <div
                      class="card-body"
                      ref="{{ ctx.nestedKey }}"
                      id="{{ ctx.instance.id }}-{{ ctx.component.key }}"
                      >
                      {{ ctx.children }}
                    </div>
                    {% } %}
                    </div>
      `,
    },
    wizard: {
      form: `<div class="wizard-container-vertical" style="display: flex; height: 100vh; overflow: hidden;">
  <!-- Menu lateral fixo -->
  <div class="wizard-page-container" style="width: 280px; margin-right: 5px; padding: 7px; flex-shrink: 0; overflow-y: auto;">
    <nav aria-label="navigation" id="{{ ctx.wizardKey }}-header" style="padding: 1px">
      <div class="card-title-custom" style="width: 100%;">Menu Principal</div>
      <ul class="pagination flex-column">
        {% ctx.panels.forEach(function(panel, index) { %}
        <li style="cursor: pointer; width: 100%;" class="col-xs-12 page-item{{ctx.currentPage === index ? ' active' : ''}}">
          <span class="page-link" ref="{{ctx.wizardKey}}-link" style="margin-left: 0px;">
            {{ctx.t(panel.title, { _userInput: true })}}
            {% if (panel.filled) { %}
              <i class="fa fa-check text-success"></i>
            {% } else { %}
              <i class="fa fa-times text-danger"></i>
            {% } %}
            {% if (panel.tooltip && ctx.currentPage === index) { %}
              <i ref="{{ctx.wizardKey}}-tooltip" class="{{ctx.iconClass('question-sign')}} text-muted" data-tooltip="{{panel.tooltip}}"></i>
            {% } %}
          </span>
        </li>
        {% }) %}
      </ul>
    </nav>

{% if (ctx.options.somenteLeitura) { %}

    <button disabled class="btn btn-primary w-100" id="btnValidaFormulario" ref="btnValidaFormulario">
      {{ ctx.t('Gravar Alterações') }}
    </button>
      {% } else { %}
    <button class="btn btn-primary w-100" id="btnValidaFormulario" ref="btnValidaFormulario">
      {{ ctx.t('Gravar Alterações') }}
    </button>
        {% } %}

  </div>

  <!-- Conteúdo com scroll -->
  <div class="wizard-page-container" style="flex: 1 1 auto; overflow-y: auto; padding: 7px;">
    {% ctx.panels.forEach(function(panel, index) { %}
      {% if (panel.key == ctx.key) { %}
        <div class="card-title-custom" style="padding: 6px">{{ctx.t(panel.title, { _userInput: true })}}</div>
      {% } %}
    {% }) %}
    <div class="card wizard-page" style="padding: 7px;" ref="{{ctx.wizardKey}}">
      {{ctx.components}}
    </div>
    {{ ctx.wizardNav }}
  </div>
</div>

`,
    },
    componentModal: {
      form: `{% if (!ctx.component.hideLabel) { %}
<div class="formio-component-modal-wrapper formio-component-modal-wrapper-{{ ctx.component.type }}" ref="componentModalWrapper">
   <div ref="openModalWrapper"></div>
   <!-- Bootstrap Styled Modal -->
   <div class="modal fade show d-block component-rendering-hidden"
      tabindex="-1"
      ref="modalWrapper"
      style=" z-index: 1050; display: block; background: transparent; position: fixed; top: 0; right: 0; width: 100vw; height: 100vh; pointer-events: none;">
      <div class="modal-dialog modal-dialog-scrollable"
         style=" z-index: 1050; position: absolute; right: 0; margin-right: 50px; margin-top: 100px; top: 0; height: 80vh; width: auto; max-width: 600px; pointer-events: auto;">
         <div class="modal-content" aria-labelledby="ml-{{ ctx.instance.id }}-{{ ctx.component.key }}" ref="modalContents">
            <div class="modal-header">
               <h5 class="modal-title">{{ ctx.t(ctx.component.label) }}</h5>
                <div class="modal-header-buttons">
               <button ref="resizeModal"  class="btn-modal btn-modal-white" id="resizeModal">
                    <i class="fas fa-expand-alt"></i>
               </button>
               <button ref="openModalNewTab"  class="btn-modal btn-modal-white"  id="openModalNewTab">
                    <i class="fas fa-up-right-from-square"></i>
                 </button>

                <button ref="modalClose" class="btn-modal btn-modal-white"  id="modalClose">
                    <i class="fas fa-window-close"></i>
                 </button>


               </div>
            </div>
            <div class="modal-body" style="overflow-x: auto; border: 1px solid #e0e0e0;">
               {% if (ctx.visible) { %}
               {{ ctx.children }}
               {% } %}
            </div>
            <div class="modal-footer" style="border: 1px solid #e0e0e0;">

               <button class="btn btn-success formio-dialog-button" ref="modalSave">
               {{ ctx.t('Fechar') }}
               </button>


            </div>
         </div>
      </div>
   </div>
</div>
<!-- 🔹 Script to Allow Background Input -->
<script>



</script>
{% } %}`,
    },

    modalPreview: {
      form: `{% if (!ctx.component.hideLabel) { %}

  <br>
  <span class="sr-only" ref="modalPreviewLiveRegion" aria-live="assertive"></span>
{% } %}

<button
  lang="en"
  class="link-button"
  ref="openModal"
  aria-labelledby="l-{{ ctx.component.key }}"
>
  {{ ctx.component.label }}
</button>


<div class="formio-errors invalid-feedback">
  {{ ctx.messages }}
</div>


`,
    },

    wizardNav: {
      form: `<ul class="formio-wizard-nav-container list-inline" id="{{ ctx.wizardKey }}-nav">
  {% ctx.buttonOrder.forEach(function(button) { %}
    {% if (button === 'cancel' && ctx.buttons.cancel) { %}
      <li>
        <button class="btn btn-secondary btn-wizard-nav-cancel" ref="{{ ctx.wizardKey }}-cancel" aria-label="{{ ctx.t('cancelButtonAriaLabel') }}">
          {{ ctx.t('cancel') }}
        </button>
      </li>
    {% } %}
    {% if (button === 'previous' && ctx.buttons.previous) { %}
      <li>
        <button class="btn btn-primary btn-wizard-nav-previous" ref="{{ ctx.wizardKey }}-previous" aria-label="{{ ctx.t('previousButtonAriaLabel') }}">
          {{ ctx.t('previous') }}
        </button>
      </li>
    {% } %}
    {% if (button === 'next' && ctx.buttons.next) { %}
      <li>
        <button class="btn btn-primary btn-wizard-nav-next" ref="{{ ctx.wizardKey }}-next" aria-label="{{ ctx.t('nextButtonAriaLabel') }}">
          {{ ctx.t('next') }}
        </button>
      </li>
    {% } %}
    {% if (button === 'submit' && ctx.buttons.submit) { %}
      <li>
        {% if (ctx.disableWizardSubmit || ctx.options.somenteLeitura) { %}
          <button disabled class="btn btn-primary btn-wizard-nav-submit" ref="{{ ctx.wizardKey }}-submit" aria-label="{{ ctx.t('submit') }} button. Click to submit the form">
            {{ ctx.t('submit') }}
          </button>
        {% } else { %}
          <button class="btn btn-primary btn-wizard-nav-submit" ref="{{ ctx.wizardKey }}-submit" aria-label="{{ ctx.t('submit') }} button. Click to submit the form">
            {{ ctx.t('submit') }}
          </button>
        {% } %}
      </li>
    {% } %}
  {% }) %}

    <li>
        <button id="btnFechaFormulario" class="btn btn-primary btn-danger" ref="btnFechaFormulario" aria-label="{{ ctx.t('closeButtonAriaLabel') }}">
          {{ ctx.t('Fechar') }}
        </button>
      </li>

</ul>`,



    },


    input: {
      form: `

      {% if (ctx.prefix || ctx.suffix) { %}
  <div class="input-group">
{% } %}

  {% if (ctx.prefix) { %}

    <div class="input-group-prepend" ref="prefix">
      <span class="input-group-text">

        {% if (ctx.prefix instanceof HTMLElement) { %}
          {{ ctx.t(ctx.prefix.outerHTML, { _userInput: true }) }}
        {% } else { %}
          <b>{{ ctx.t(ctx.prefix, { _userInput: true }) }} {% if (typeof index === 'number') { %} N&ordm; {{ index + 1 }}   {% } %}</b>
        {% } %}
      </span>
    </div>
  {% } %}

  {% if (!ctx.component.editor && !ctx.component.wysiwyg) { %}
    <{{ ctx.input.type }}
      ref="{{ ctx.input.ref ? ctx.input.ref : 'input' }}"
      {% for (var attr in ctx.input.attr) { %}
        {{ attr }}="{{ ctx.input.attr[attr] }}"
      {% } %}
      id="{{ ctx.instance.id }}-{{ ctx.component.key }}"
      aria-labelledby="l-{{ ctx.instance.id }}-{{ ctx.component.key }}{% if (ctx.component.description) { %} d-{{ ctx.instance.id }}-{{ ctx.component.key }}{% } %}"
      aria-required="{{
        ctx.input.ref === 'input' || !ctx.input.ref
          ? ctx.component.validate.required
          : (ctx.component.fields && ctx.component.fields[ctx.input.ref] && ctx.component.fields[ctx.input.ref].required) || false
      }}"
    >
      {{ ctx.input.content }}
    </{{ ctx.input.type }}>
    {% if (ctx.hasValueMaskInput) { %}
      <input ref="valueMaskInput" />
    {% } %}
  {% } %}

  {% if (ctx.component.editor || ctx.component.wysiwyg) { %}
    <div ref="input"></div>
  {% } %}

  {% if (ctx.component.type === 'datetime') { %}
    <span aria-live="assertive" id="{{ ctx.instance.id }}-liveRegion" class="sr-only" ref="liveRegion"></span>
  {% } %}

  {% if (ctx.suffix) { %}
    <div class="input-group-append" ref="suffix">
      <span class="input-group-text">
        {% if (ctx.suffix instanceof HTMLElement) { %}
          {{ ctx.t(ctx.suffix.outerHTML, { _userInput: true }) }}
        {% } else { %}
          {{ ctx.t(ctx.suffix, { _userInput: true }) }}
        {% } %}
      </span>
    </div>
  {% } %}

{% if (ctx.prefix || ctx.suffix) { %}
  </div>
{% } %}

{% if (ctx.component.showCharCount || ctx.component.showWordCount) { %}
  <div class="form-text {{ ctx.component.description ? 'pull-right' : 'text-right' }}">
    {% if (ctx.component.showCharCount) { %}
      <span class="text-muted" ref="charcount" aria-live="polite"></span>
    {% } %}
    {% if (ctx.component.showWordCount) { %}
      <span class="text-muted" ref="wordcount" aria-live="polite"></span>
    {% } %}
  </div>
{% } %}
`,



    },

    datagrid: {
      form: `<table class="table datagrid-table table-bordered
  {% if (ctx.component.striped) { %}table-striped{% } %}
  {% if (ctx.component.hover) { %}table-hover{% } %}
  {% if (ctx.component.condensed) { %}table-sm{% } %}"
  {% if (ctx.component.layoutFixed) { %}style="table-layout: fixed;"{% } %}>

  {% if (ctx.hasHeader) { %}
    <thead>
      <tr>
        {% if (ctx.component.reorder) { %}<th></th>{% } %}

        {% ctx.columns.forEach(function(col) { %}
          <th class="{% if (col.validate && col.validate.required) { %}field-required{% } %}">
            {% if (!col.hideLabel) { %}{{ ctx.t(col.label || col.title, { _userInput: true }) }}{% } %}
            {% if (col.tooltip) { %}
              <i ref="tooltip" tabindex="0" data-title="{{ col.tooltip }}"
                class="{{ ctx.iconClass('question-sign') }} text-muted"
                data-tooltip="{{ col.tooltip }}"></i>
            {% } %}
          </th>
        {% }) %}

        {% if (ctx.hasExtraColumn) { %}
          <th>
            <span class="sr-only">{{ ctx.t('Add/Remove') }}</span>
            {% if (!ctx.builder && ctx.hasAddButton && ctx.hasTopSubmit) { %}
              <button class="btn btn-primary formio-button-add-row" ref="{{ ctx.datagridKey }}-addRow" tabindex="{{ ctx.tabIndex }}">
                <i class="{{ ctx.iconClass('plus') }}"></i>{{ ctx.t(ctx.component.addAnother || 'Add Another', { _userInput: true }) }}
              </button>
            {% } %}
          </th>
        {% } %}
      </tr>
    </thead>
  {% } %}

  <tbody ref="{{ ctx.datagridKey }}-tbody" data-key="{{ ctx.datagridKey }}">
    {% ctx.rows.forEach(function(row, index) { %}
      {% if (ctx.hasGroups && ctx.groups[index]) { %}
        <tr ref="{{ ctx.datagridKey }}-group-header" class="datagrid-group-header{% if (ctx.hasToggle) { %} clickable{% } %}">
          <td ref="{{ ctx.datagridKey }}-group-label" colspan="{{ ctx.numColumns }}" class="datagrid-group-label">
            {{ ctx.groups[index].label }}
          </td>
        </tr>
      {% } %}

      <tr ref="{{ ctx.datagridKey }}-row">
        {% if (ctx.component.reorder) { %}
          <td class="col-md-1">
            <button type="button" class="formio-drag-button btn btn-default fa fa-bars" data-key="{{ ctx.datagridKey }}"></button>
          </td>
        {% } %}

        {% ctx.columns.forEach(function(col) { %}
          <td ref="{{ ctx.datagridKey }}"{% if (col.key && col.overlay && col.overlay.width) { %} style="width: {{ col.overlay.width }}px"{% } %}>
            {{ row[col.key] }}
          </td>
        {% }) %}

        {% if (ctx.hasExtraColumn) { %}
          {% if (ctx.hasRemoveButtons) { %}
            <td class="col-auto">
              <button type="button" class="btn btn-secondary formio-button-remove-row" ref="{{ ctx.datagridKey }}-removeRow" tabindex="{{ ctx.tabIndex }}" aria-label="{{ ctx.t('remove') }}">
                <i class="{{ ctx.iconClass('remove-circle') }}"></i>
              </button>
            </td>
          {% } %}

          {% if (ctx.canAddColumn) { %}
            <td ref="{{ ctx.key }}-container" class="col-md-3">
              {{ ctx.placeholder }}
            </td>
          {% } %}
        {% } %}
      </tr>
    {% }) %}
  </tbody>

  {% if (!ctx.builder && ctx.hasAddButton && ctx.hasBottomSubmit) { %}
    <tfoot>
      <tr>
        <td colspan="{{ ctx.component.layoutFixed ? ctx.numColumns : ctx.numColumns + 1 }}">
          <button class="btn btn-primary formio-button-add-row" ref="{{ ctx.datagridKey }}-addRow" tabindex="{{ ctx.tabIndex }}">
            <i class="{{ ctx.iconClass('plus') }}"></i> {{ ctx.t(ctx.component.addAnother || 'Add Another', { _userInput: true }) }}
          </button>
        </td>
      </tr>
    </tfoot>
  {% } %}

</table>`,
    },

  },
};
