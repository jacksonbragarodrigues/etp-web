import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCKEditorComponent } from '../custom-ckeditor/custom-ckeditor.component';
import { CustomCKEditorService } from '../../services/custom-ckeditor.service';

export interface AnnotationRow {
  id: string;
  type: 'apontamento' | 'observacao';
  responseType?: string;
  content: string; // rich text html
  editorId?: string;
  internalNote?: boolean;
}

@Component({
  selector: 'app-annotations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomCKEditorComponent],
  exportAs: 'annotationsModal',
  template: `
    <div class="custom-modal-backdrop" [class.show]="isOpen" (click)="onBackdropClick($event)"></div>

    <div class="modal" [class.show]="isOpen" [style.display]="isOpen ? 'block' : 'none'" tabindex="-1" aria-labelledby="annotationsModalLabel" [attr.aria-hidden]="!isOpen">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="annotationsModalLabel">
              <i class="bi bi-journal-text me-2"></i>
              Apontamentos e Notas
            </h5>
            <button type="button" class="btn-close" (click)="close()" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="fw-semibold">Linhas</div>
              <button type="button" class="btn btn-sm btn-primary" (click)="addRow()">
                <i class="bi bi-plus-lg me-1"></i>
                Adicionar linha
              </button>
            </div>

            <div *ngIf="rows.length === 0" class="text-muted small">Nenhuma linha adicionada.</div>

            <div *ngFor="let row of rows; let i = index" class="card mb-3">
              <div class="card-body" [class.annotation-internal-bg]="row.internalNote">
                <div class="row g-2 align-items-start">
                  <div class="col-12 col-md-3">
                    <label class="form-label small">Tipo</label>
                    <select class="form-select form-select-sm" [(ngModel)]="row.type">
                      <option [ngValue]="'apontamento'">Apontamento</option>
                      <option [ngValue]="'observacao'">Observação</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-3">
                    <label class="form-label small">Tipo de resposta</label>
                    <select class="form-select form-select-sm" [(ngModel)]="row.responseType">
                      <option [ngValue]="'nao_informado'">Não Informado</option>
                      <option [ngValue]="'ajuste'">Ajuste</option>
                      <option [ngValue]="'exigencia'">Exigência</option>
                      <option [ngValue]="'comentario'">Comentário</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label small">Conteúdo</label>
                    <app-custom-ckeditor [config]="editorConfig" [(ngModel)]="row.content" [editorId]="row.editorId"></app-custom-ckeditor>
                    <div class="form-check mt-2">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="row.internalNote" [ngModelOptions]="{standalone: true}" id="ni_{{row.id}}">
                      <label class="form-check-label small" for="ni_{{row.id}}">Nota Interna</label>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end mt-2">
                  <button type="button" class="btn btn-outline-danger btn-sm" (click)="removeRow(row.id)">
                    <i class="bi bi-trash me-1"></i>
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="onSaveClick()">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 90vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1040;
      opacity: 0;
      transition: opacity 0.15s linear;
      pointer-events: none;
    }
    .custom-modal-backdrop.show { opacity: 1; pointer-events: auto; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050; outline: 0; overflow-x: hidden; overflow-y: auto; }
    .modal.show { display: block !important; }
    .modal-dialog { position: relative; width: auto; margin: 0.5rem; pointer-events: none; transition: transform 0.3s ease-out; transform: translate(0, -50px); }
    .modal.show .modal-dialog { transform: none; }
    .modal-content { position: relative; display: flex; flex-direction: column; width: 100%; pointer-events: auto; }
    :host ::ng-deep .ck.ck-editor { width: 100%; }
    :host ::ng-deep .ck-editor__editable { min-height: 140px; }
  `]
})
export class AnnotationsModalComponent {
  isOpen = false;
  rows: AnnotationRow[] = [];
  private currentComponentId: string | null = null;
  private onSaveCb?: (rows: AnnotationRow[]) => void;

  editorConfig = {
    toolbar: {
      items: [
        'heading', '|',
        'bold', 'italic', 'underline', '|',
        'fontSize', 'fontColor', 'fontBackgroundColor', '|',
        'alignment', '|',
        'bulletedList', 'numberedList', '|',
        'link', 'insertTable', 'blockQuote', '|',
        'undo', 'redo'
      ]
    },
    language: 'pt-br'
  };

  constructor(private ckSvc: CustomCKEditorService) {}

  open(componentId: string, initialRows: AnnotationRow[] = [], defaultType?: 'apontamento' | 'observacao', onSave?: (rows: AnnotationRow[]) => void): void {
    this.currentComponentId = componentId;
    this.rows = initialRows && initialRows.length > 0 ? initialRows.map(r => ({ ...r })) : [];
    if (this.rows.length === 0) {
      const id = this.genId();
      this.rows.push({ id, type: defaultType || 'apontamento', responseType: 'nao_informado', content: '', editorId: this.ckSvc.generateUniqueId('annotations-' + id), internalNote: false });
    }
    this.ensureEditorIds();
    this.onSaveCb = onSave;
    this.isOpen = true;
    document.body.classList.add('modal-open');
  }

  close(): void {
    this.isOpen = false;
    document.body.classList.remove('modal-open');
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  addRow(): void {
    const id = this.genId();
    this.rows.push({ id, type: 'apontamento', responseType: 'nao_informado', content: '', editorId: this.ckSvc.generateUniqueId('annotations-' + id), internalNote: false });
  }

  removeRow(id: string): void {
    this.rows = this.rows.filter(r => r.id !== id);
  }

  onSaveClick(): void {
    const cleaned = this.rows.map(r => ({ ...r }));
    if (this.onSaveCb) this.onSaveCb(cleaned);
    this.close();
  }

  private ensureEditorIds(): void {
    this.rows = this.rows.map(r => ({
      ...r,
      editorId: r.editorId || this.ckSvc.generateUniqueId('annotations-' + r.id)
    }));
  }

  private genId(): string {
    return 'ann_' + Math.random().toString(36).slice(2, 9);
  }
}
