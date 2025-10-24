import { Injectable } from '@angular/core';

declare global {
  interface Window {
    ClassicEditor: any;
  }
}

interface CKEditorInstance {
  id: string;
  editor: any;
  element: HTMLElement;
}

@Injectable({
  providedIn: 'root'
})
export class CustomCKEditorService {
  private instances: Map<string, CKEditorInstance> = new Map();
  private instanceCounter = 0;

  constructor() {}

  /**
   * Generate a unique ID for a CKEditor instance
   */
  generateUniqueId(prefix: string = 'ckeditor'): string {
    this.instanceCounter++;
    return `${prefix}_${this.instanceCounter}_${Date.now()}`;
  }

  /**
   * Create a new CKEditor instance
   */
  async createEditor(elementId: string, config: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check if window.ClassicEditor is available
      if (!window.ClassicEditor) {
        reject(new Error('ClassicEditor is not available. Make sure the CKEditor script is loaded.'));
        return;
      }

      const element = document.querySelector(`#${elementId}`);
      if (!element) {
        reject(new Error(`Element with ID '${elementId}' not found.`));
        return;
      }

      // Default configuration
      const defaultConfig = {
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
            { color: 'hsl(0, 0%, 0%)', label: 'Black' },
            { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
            { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
            { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
            { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
            { color: 'hsl(0, 75%, 60%)', label: 'Red' },
            { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
            { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
            { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
            { color: 'hsl(120, 75%, 60%)', label: 'Green' },
            { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
            { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
            { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
            { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
            { color: 'hsl(270, 75%, 60%)', label: 'Purple' }
          ]
        },
        placeholder: 'Digite seu conteúdo aqui...'
      };

      // Merge user config with default config
      const finalConfig = { ...defaultConfig, ...config };

      // Create the editor
      window.ClassicEditor
        .create(element, finalConfig)
        .then((editor: any) => {
          console.log('Custom CKEditor initialized for element:', elementId);

          // Store the instance
          const instance: CKEditorInstance = {
            id: elementId,
            editor: editor,
            element: element as HTMLElement
          };
          this.instances.set(elementId, instance);

          resolve(editor);
        })
        .catch((error: any) => {
          console.error('Error creating CKEditor:', error);
          reject(error);
        });
    });
  }

  /**
   * Get an existing editor instance
   */
  getEditor(elementId: string): any | null {
    const instance = this.instances.get(elementId);
    return instance ? instance.editor : null;
  }

  /**
   * Destroy a specific editor instance
   */
  async destroyEditor(elementId: string): Promise<void> {
    const instance = this.instances.get(elementId);
    if (instance && instance.editor) {
      try {
        await Promise.resolve(instance.editor.destroy()).catch(() => {});
      } catch (error) {
        // Ignore internal CKEditor destroy errors to avoid breaking UX
      } finally {
        this.instances.delete(elementId);
        console.log('CKEditor instance destroyed:', elementId);
      }
    }
  }

  /**
   * Destroy all editor instances
   */
  async destroyAllEditors(): Promise<void> {
    const destroyPromises: Promise<void>[] = [];
    
    for (const [elementId] of this.instances) {
      destroyPromises.push(this.destroyEditor(elementId));
    }

    await Promise.all(destroyPromises);
    console.log('All CKEditor instances destroyed');
  }

  /**
   * Get the count of active instances
   */
  getInstanceCount(): number {
    return this.instances.size;
  }

  /**
   * Get all active instance IDs
   */
  getActiveInstanceIds(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Update editor content
   */
  setEditorData(elementId: string, data: string): void {
    const instance = this.instances.get(elementId);
    if (instance && instance.editor) {
      instance.editor.setData(data);
    }
  }

  /**
   * Get editor content
   */
  getEditorData(elementId: string): string {
    const instance = this.instances.get(elementId);
    if (instance && instance.editor) {
      return instance.editor.getData();
    }
    return '';
  }

  /**
   * Check if ClassicEditor is available
   */
  isClassicEditorAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.ClassicEditor;
  }

  /**
   * Wait for ClassicEditor to be available
   */
  waitForClassicEditor(maxWaitTime: number = 10000): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isClassicEditorAvailable()) {
        resolve(true);
        return;
      }

      const checkInterval = 100;
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed += checkInterval;

        if (this.isClassicEditorAvailable()) {
          clearInterval(interval);
          resolve(true);
        } else if (elapsed >= maxWaitTime) {
          clearInterval(interval);
          reject(new Error('ClassicEditor was not loaded within the specified time'));
        }
      }, checkInterval);
    });
  }

  /**
   * Cleanup unused instances (called periodically or on component destroy)
   */
  cleanupUnusedInstances(): void {
    const instancesToRemove: string[] = [];

    for (const [elementId, instance] of this.instances) {
      // Check if the element still exists in the DOM
      if (!document.querySelector(`#${elementId}`)) {
        instancesToRemove.push(elementId);
      }
    }

    // Destroy instances for removed elements
    instancesToRemove.forEach(elementId => {
      this.destroyEditor(elementId);
    });

    if (instancesToRemove.length > 0) {
      console.log('Cleaned up unused CKEditor instances:', instancesToRemove);
    }
  }
}
