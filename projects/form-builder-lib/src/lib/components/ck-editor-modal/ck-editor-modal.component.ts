import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCKEditorComponent } from '../custom-ckeditor/custom-ckeditor.component';
import { CustomCKEditorService } from '../../services/custom-ckeditor.service';

declare var bootstrap: any;

@Component({
  selector: 'app-ck-editor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomCKEditorComponent],
  template: `
    <!-- Custom Backdrop -->
    <div class="custom-modal-backdrop" [attr.id]="backdropId" [class.show]="isModalOpen" (click)="onBackdropClick($event)"></div>

    <!-- Modal -->
    <div class="modal" [attr.id]="modalId" [class.show]="isModalOpen" [style.display]="isModalOpen ? 'block' : 'none'" tabindex="-1" aria-labelledby="ckEditorModalLabel" [attr.aria-hidden]="!isModalOpen">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ckEditorModalLabel">
              <i class="bi bi-pencil-square me-2"></i>
              Editor de Texto de Ajuda
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="ck-editor-modal-wrapper">
              <app-custom-ckeditor
                *ngIf="isModalOpen"
                [config]="editorConfig"
                [(ngModel)]="content"
                [editorId]="getModalEditorId()"
                (ready)="onEditorReady($event)"
                style="min-height: 400px;">
              </app-custom-ckeditor>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="saveAndClose()">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom backdrop */
    .custom-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1040;
      opacity: 0;
      transition: opacity 0.15s linear;
      pointer-events: none;
    }

    .custom-modal-backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }

    /* Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1050;
      outline: 0;
      overflow-x: hidden;
      overflow-y: auto;
    }

    .modal.show {
      display: block !important;
    }

    .modal-dialog {
      position: relative;
      width: auto;
      margin: 0.5rem;
      pointer-events: none;
      transition: transform 0.3s ease-out;
      transform: translate(0, -50px);
    }

    .modal.show .modal-dialog {
      transform: none;
    }

    .modal-content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 0.3rem;
      outline: 0;
      pointer-events: auto;
    }

    .ck-editor-modal-wrapper {
      min-height: 400px;
    }

    /* CKEditor específico */
    :host ::ng-deep .ck-editor__editable {
      min-height: 350px;
    }

    :host ::ng-deep .ck.ck-editor {
      width: 100%;
      position: relative;
      z-index: 1051;
    }

    /* Garantir que todos os elementos CKEditor fiquem acima */
    :host ::ng-deep .ck.ck-balloon-panel {
      z-index: 1060 !important;
    }

    :host ::ng-deep .ck.ck-dropdown__panel {
      z-index: 1060 !important;
    }

    :host ::ng-deep .ck.ck-tooltip {
      z-index: 1060 !important;
    }

    :host ::ng-deep .ck.ck-inspector {
      z-index: 1060 !important;
    }

    /* Evitar sobreposição de outros elementos */
    :host ::ng-deep .ck-body .ck-balloon-panel {
      z-index: 1060 !important;
    }
  `]
})
export class CkEditorModalComponent {
  content: string = '';
  isModalOpen: boolean = false;
  private modalEditorId: string = '';
  modalId: string = '';
  backdropId: string = '';
  private lastFocusedElement: HTMLElement | null = null;

  editorConfig = {
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
        {
          color: 'hsl(0, 0%, 0%)',
          label: 'Black'
        },
        {
          color: 'hsl(0, 0%, 30%)',
          label: 'Dim grey'
        },
        {
          color: 'hsl(0, 0%, 60%)',
          label: 'Grey'
        },
        {
          color: 'hsl(0, 0%, 90%)',
          label: 'Light grey'
        },
        {
          color: 'hsl(0, 0%, 100%)',
          label: 'White',
          hasBorder: true
        },
        {
          color: 'hsl(0, 75%, 60%)',
          label: 'Red'
        },
        {
          color: 'hsl(30, 75%, 60%)',
          label: 'Orange'
        },
        {
          color: 'hsl(60, 75%, 60%)',
          label: 'Yellow'
        },
        {
          color: 'hsl(90, 75%, 60%)',
          label: 'Light green'
        },
        {
          color: 'hsl(120, 75%, 60%)',
          label: 'Green'
        },
        {
          color: 'hsl(150, 75%, 60%)',
          label: 'Aquamarine'
        },
        {
          color: 'hsl(180, 75%, 60%)',
          label: 'Turquoise'
        },
        {
          color: 'hsl(210, 75%, 60%)',
          label: 'Light blue'
        },
        {
          color: 'hsl(240, 75%, 60%)',
          label: 'Blue'
        },
        {
          color: 'hsl(270, 75%, 60%)',
          label: 'Purple'
        }
      ]
    },
    licenseKey: '',
    placeholder: 'Digite o texto de ajuda aqui...',
    // Configurações específicas para modal
    balloonToolbar: ['bold', 'italic', 'link'],
    blockToolbar: [
      'paragraph', 'heading2', 'heading3', '|',
      'bulletedList', 'numberedList', '|',
      'blockQuote'
    ]
  };

  private onSaveCallback?: (content: string) => void;

  constructor(private customCKEditorService: CustomCKEditorService) {
    this.modalEditorId = this.customCKEditorService.generateUniqueId('ck-editor-modal');
    this.modalId = this.customCKEditorService.generateUniqueId('ckEditorModal');
    this.backdropId = this.customCKEditorService.generateUniqueId('ckEditorBackdrop');
  }

  getModalEditorId(): string {
    return this.modalEditorId;
  }

  onEditorReady(editor: any): void {
    console.log('Custom CKEditor modal ready with ID:', this.modalEditorId);

    // Garantir que o editor funcione corretamente dentro do modal
    if (editor && editor.ui && editor.ui.getEditableElement) {
      const editableElement = editor.ui.getEditableElement();
      if (editableElement) {
        // Garantir que eventos de clique não sejam bloqueados
        editableElement.addEventListener('click', (e: Event) => {
          e.stopPropagation();
        });

        editableElement.addEventListener('focus', (e: Event) => {
          e.stopPropagation();
        });
      }
    }
  }

  open(initialContent: string = '', onSave?: (content: string) => void): void {
    this.content = initialContent;
    this.onSaveCallback = onSave;

    // Guardar foco atual para restaurar depois
    this.lastFocusedElement = (document.activeElement as HTMLElement) || null;

    // Mostrar modal
    this.isModalOpen = true;

    // Adicionar classe ao body para evitar scroll
    document.body.classList.add('modal-open');

    // Focus no modal após abrir
    setTimeout(() => {
      const modalElement = document.getElementById(this.modalId);
      if (modalElement) {
        try { (modalElement as HTMLElement).focus(); } catch {}
      }
    }, 100);
  }

  closeModal(): void {
    // Remover foco de qualquer elemento dentro do modal antes de ocultar
    const modalElement = document.getElementById(this.modalId);
    const active = document.activeElement as HTMLElement | null;
    if (modalElement && active && modalElement.contains(active)) {
      try { active.blur(); } catch {}
    }

    this.isModalOpen = false;
    document.body.classList.remove('modal-open');

    // Restaurar foco ao elemento anterior, se existir
    if (this.lastFocusedElement) {
      setTimeout(() => {
        try { this.lastFocusedElement?.focus(); } catch {}
        this.lastFocusedElement = null;
      }, 0);
    } else {
      // Garantir que algum elemento fora do modal tenha foco
      setTimeout(() => { try { (document.body as HTMLElement).focus(); } catch {} }, 0);
    }

    // Clean up the CKEditor instance when modal closes
    if (this.modalEditorId) {
      setTimeout(() => {
        this.customCKEditorService.destroyEditor(this.modalEditorId);
        // Generate new ID for next time modal opens
        this.modalEditorId = this.customCKEditorService.generateUniqueId('ck-editor-modal');
      }, 100);
    }
  }

  saveAndClose(): void {
    if (this.onSaveCallback) {
      this.onSaveCallback(this.content);
    }
    this.closeModal();
  }

  onBackdropClick(event: Event): void {
    // Fechar modal apenas se clicar no backdrop (não nos elementos filhos)
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
