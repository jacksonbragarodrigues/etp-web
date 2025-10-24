import traducaoPt from './traducaoPtBr';
import editFormCustom from './editFormCustom';
import builderCustom from './builderCustom';

export const optionsPtBrConstrutor = {
  readOnly: false,
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
      form: `
              <div class="wizard-container-vertical" style="display: flex !important">


                <div class=" wizard-page-container" style="width: 280px !important; margin-right: 5px ; padding: 7px">
                <nav aria-label="navigation" id="{{ ctx.wizardKey }}-header" style="padding: 1px">
                    <div class="card-title-custom" style="width: 280px !important;">Menu Principal</div>
                    <ul class="pagination flex-column">
                      <!-- Directly add flex-column -->
                      {% ctx.panels.forEach(function(panel, index) { %}
                      <li style="cursor: pointer;width: 280px !important"
                          class="col-xs-12 page-item{{ctx.currentPage === index ? ' active' : ''}}"
                          >
                          <span class="page-link" ref="{{ctx.wizardKey}}-link" style="margin-left: 0px;">
                           {{ctx.t(panel.title, { _userInput: true })}}



                          {% if (panel.tooltip && ctx.currentPage === index) { %}
                          <i ref="{{ctx.wizardKey}}-tooltip" class="{{ctx.iconClass('question-sign')}} text-muted" data-tooltip="{{panel.tooltip}}"></i>
                          {% } %}
                          </span>
                      </li>
                      {% }) %}
                    </ul>
                </nav>




                </div>

                <div class=" wizard-page-container" style="min-width: 80% !important; margin: 0px ; padding: 7px">
                    {% ctx.panels.forEach(function(panel, index) { %}
                        {% if (panel.key == ctx.key) { %}
                          <div class="card-title-custom" style="padding: 6px" >{{ctx.t(panel.title, { _userInput: true })}}</div>
                        {% } %}
                    {% }) %}
                    <div class="card wizard-page" style="padding: 7px" ref="{{ctx.wizardKey}}">
                      {{ctx.components}}
                    </div>
                    {{ ctx.wizardNav }}
                </div>
              </div>`,
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


  },
};
