import { Components } from '@formio/angular';

const contentComponent = Components.components.content;

export default class BotaoAjuda extends contentComponent {
  public html2pdf = require('html2pdf.js');

  constructor(component: any, options: any, data: any) {
    super(component, options, data);
  }

  static get builderInfo() {
    return {
      title: 'Botão de Ajuda',
      modalEdit: true,
      schema: BotaoAjuda.schema({}),
    };
  }

  static get builderTemplate() {
    return `
        <div class="formio-custom-text">
          <span style="color: gray;">[Texto será exibido apenas na renderização]</span>
        </div>
      `;
  }

  override attach(element: HTMLElement) {
    this.setupBuilderMode(element);
    this.observeModalWrappers();
    this.setupModalInteractions(element);
    return super.attach(element);
  }

  public setupBuilderMode(element: HTMLElement) {
    if (this.options.attachMode === 'builder') {
      const componentElement = element?.querySelector('[ref="component"]');
      if (componentElement) {
        componentElement.innerHTML = `<div class='link-builder-ajuda'>${this.component.label}</div>`;
      }
    }
  }

  public observeModalWrappers() {
    const modalWrappers = document.querySelectorAll('[ref="modalWrapper"]');
    modalWrappers.forEach((modalWrapper) => {
      if (modalWrapper) {
        const observer = new MutationObserver((mutationsList) => {
          mutationsList.forEach((mutation) => {
            if (
              mutation.type === 'attributes' &&
              mutation.attributeName === 'class'
            ) {
              if (
                !modalWrapper.classList.contains('component-rendering-hidden')
              ) {
                this.fecharOutrosModais(modalWrapper);
              }
            }
          });
        });

        observer.observe(modalWrapper, {
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    });
  }

  public setupModalInteractions(element: HTMLElement) {
    const modalDialog = element.querySelector(
      '[ref="modalContents"]'
    ) as HTMLDivElement;
    const resizeButton = element.querySelector(
      '[ref="resizeModal"]'
    ) as HTMLDivElement;
    const modalHtml = element.querySelector('[ref="html"]') as HTMLDivElement;
    const openModalNewTab = element.querySelector(
      '[ref="openModalNewTab"]'
    ) as HTMLDivElement;

    if (openModalNewTab) {
      openModalNewTab.replaceWith(openModalNewTab.cloneNode(true));
      const newBtn = element.querySelector(
        '[ref="openModalNewTab"]'
      ) as HTMLDivElement;
      newBtn?.addEventListener('click', () => {
        this.gerarPdf(modalHtml);
      });
    }

    if (resizeButton) {
      resizeButton.replaceWith(resizeButton.cloneNode(true));
      const newBtn = element.querySelector(
        '[ref="resizeModal"]'
      ) as HTMLDivElement;
      newBtn?.addEventListener('click', () => {
        const expanded = modalDialog.classList.contains('expanded');
        modalDialog.style.width = expanded ? '80vw' : '90vw';
        modalDialog.style.height = expanded ? '80vh' : '90vh';
        modalDialog.style.maxWidth = expanded ? '600px' : '300px';
        modalDialog.classList.toggle('expanded');
      });
    }

  }

  // Função para fechar (ocultar) os modais
  fecharOutrosModais(currentModal: any) {
    const modalWrappers = document.querySelectorAll('[ref="modalWrapper"]');

    modalWrappers.forEach((modalWrapper) => {
      // Fecha todos os modais, exceto o atual
      const teste = modalWrapper as HTMLDivElement;
      if (teste !== currentModal) {
        teste.classList.add('component-rendering-hidden'); // Remover a classe 'show' para esconder o modal
      }
    });
  }
  public gerarPdf(modalHtml: any) {
    this.html2pdf()
      .from(modalHtml)
      .toPdf()
      .get('pdf')
      .then(function (pdf: any) {
        // Cria um Blob do PDF
        const pdfBlob = pdf.output('blob');
        // Cria uma URL para o Blob
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      });
  }
}
