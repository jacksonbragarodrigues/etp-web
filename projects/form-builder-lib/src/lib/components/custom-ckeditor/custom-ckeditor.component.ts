import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomCKEditorService } from '../../services/custom-ckeditor.service';

@Component({
  selector: 'app-custom-ckeditor',
  standalone: true,
  imports: [CommonModule],
  template: `<div [id]="finalEditorId" class="custom-ckeditor-container"></div>`,
  styleUrls: ['./custom-ckeditor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCKEditorComponent),
      multi: true
    }
  ]
})
export class CustomCKEditorComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input() config: any = {};
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() placeholder: string = 'Digite seu conteúdo aqui...';
  @Input() editorId?: string; // Optional: if not provided, will be auto-generated

  @Output() ready = new EventEmitter<any>();
  @Output() change = new EventEmitter<string>();
  @Output() blur = new EventEmitter<any>();
  @Output() editorFocus = new EventEmitter<any>();

  private editor: any = null;
  private isReady: boolean = false;
  private internalEditorId: string = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private currentValue: string = '';

  constructor(private customCKEditorService: CustomCKEditorService) {}

  ngOnInit(): void {
    // Generate unique ID if not provided
    this.internalEditorId = this.editorId || this.customCKEditorService.generateUniqueId('ckeditor');
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    this.destroyEditor();
  }

  get finalEditorId(): string {
    return this.internalEditorId;
  }

  private async initializeEditor(): Promise<void> {
    try {
      // Wait for ClassicEditor to be available
      await this.customCKEditorService.waitForClassicEditor();

      // Prepare config
      const editorConfig = {
        ...this.config,
        placeholder: this.placeholder
      };

      // Create the editor
      this.editor = await this.customCKEditorService.createEditor(this.internalEditorId, editorConfig);

      // Set initial data if available
      if (this.currentValue) {
        this.editor.setData(this.currentValue);
      }

      // Set up event listeners
      this.setupEventListeners();

      // Handle disabled and readonly states
      this.updateEditorState();

      // Mark as ready
      this.isReady = true;

      // Emit ready event
      this.ready.emit(this.editor);

      console.log('Custom CKEditor component initialized with ID:', this.internalEditorId);
    } catch (error) {
      console.error('Failed to initialize CKEditor:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.editor) return;

    // Listen for content changes
    this.editor.model.document.on('change:data', () => {
      const data = this.editor.getData();
      this.currentValue = data;
      this.onChange(data);
      this.change.emit(data);
    });

    // Listen for focus events
    this.editor.ui.focusTracker.on('change:isFocused', (evt: any, propertyName: string, isFocused: boolean) => {
      if (isFocused) {
        this.editorFocus.emit(this.editor);
      } else {
        this.onTouched();
        this.blur.emit(this.editor);
      }
    });
  }

  private updateEditorState(): void {
    if (!this.editor) return;

    if (this.disabled || this.readonly) {
      this.editor.enableReadOnlyMode('disabled-readonly-mode');
    } else {
    //  this.editor.disableReadOnlyMode('disabled-readonly-mode');
    }
  }

  private destroyEditor(): void {
    if (this.editor && this.isReady) {
      this.customCKEditorService.destroyEditor(this.internalEditorId);
      this.editor = null;
      this.isReady = false;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.currentValue = value || '';
    
    if (this.editor && this.isReady) {
      this.editor.setData(this.currentValue);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.updateEditorState();
  }

  // Public methods for external access
  public getEditor(): any {
    return this.editor;
  }

  public getData(): string {
    if (this.editor && this.isReady) {
      return this.editor.getData();
    }
    return this.currentValue;
  }

  public setData(data: string): void {
    this.currentValue = data;
    if (this.editor && this.isReady) {
      this.editor.setData(data);
    }
  }

  public focus(): void {
    if (this.editor && this.isReady) {
      this.editor.editing.view.focus();
    }
  }

  public isEditorReady(): boolean {
    return this.isReady;
  }
}
