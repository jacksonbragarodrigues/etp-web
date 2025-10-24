import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilderService } from '../../services/form-builder.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'form-report',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="report-container" [innerHTML]="html"></div>`,
})
export class ReportHtmlComponent implements OnChanges {
  @Input() formJson?: string | object | null;
  @Input() dataJson?: string | object | null;
  @Input() analysisJson?: string | object | null;

  html = '';

  constructor(private fb: FormBuilderService, private report: ReportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.applyInputs();
    this.html = this.report.generateHTMLReport();
  }

  private applyInputs(): void {
    if (this.formJson) {
      const content = typeof this.formJson === 'string' ? this.formJson : JSON.stringify(this.formJson);
      this.fb.importFormSchema(content);
    }
    if (this.dataJson) {
      const content = typeof this.dataJson === 'string' ? this.dataJson : JSON.stringify(this.dataJson);
      this.fb.importFormData(content);
    }
    if (this.analysisJson) {
      const content = typeof this.analysisJson === 'string' ? this.analysisJson : JSON.stringify(this.analysisJson);
      // analysis data is stored within data under __annotations; support direct map too
      try {
        const obj = JSON.parse(content);
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          const payload = JSON.stringify({ __annotations: obj });
          this.fb.importFormData(payload);
        }
      } catch {
        /* ignore */
      }
    }
  }
}
