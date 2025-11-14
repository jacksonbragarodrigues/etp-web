import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TemplateHtmlService } from './template-html.service';
import { Subscription } from 'rxjs';
import { AtualizaDadosRelatorioService } from 'src/app/services/atualiza-dados-relatorio.service';
import { AlertUtils } from 'src/utils/alerts.util';

@Component({
  selector: 'app-template-html',
  templateUrl: './template-html.component.html',
  styleUrl: './template-html.component.scss',
})
export class TemplateHtmlComponent implements OnInit {
  @Input() idForm: any;
  @Input() jsonForm: any;
  @Input() jsonDados: any;
  @Input() descricao: any;
  @Input() type: 'ETP' | 'ETP_ANALISE' | 'FORMULARIO_COMPLETO' | 'FORMULARIO' =
    'FORMULARIO';
  @Input() nomeRelatorio: any;
  @Input() usarSigilo?: any;
 
  @ViewChild('pdfViewer') pdfViewer: any;

  @Output() fecharModal = new EventEmitter();

  public atualizaJosnForm: Subscription = {} as Subscription;
  public atualizaJsonDados: Subscription = {} as Subscription;

  constructor(
    public templateHtmlService: TemplateHtmlService,
    public atualizaDadosRelatorioServiceService: AtualizaDadosRelatorioService,
    public alertUtils: AlertUtils
  ) {}

  ngOnInit() {
    if (this.type === 'ETP') {
      this.geradorPDFEtp();
    } else if (this.type === 'ETP_ANALISE') {
      this.geradorPDFEtpAnalise();
    } else if (this.type === 'FORMULARIO_COMPLETO') {
      this.geradorPDFFormularioCompleto();
    } else {
      this.geradorPDF();
    }
  }

  geradorPDF() {
    this.templateHtmlService.geradorPDF(this.idForm).subscribe(
      (pdf: Blob) => {
        this.pdfViewer.pdfSrc = pdf;
        this.pdfViewer.refresh();
      },
      (error: any) => {
        error.error.detail = 'Erro ao converter HTML para PDF';
        this.alertUtils.toastrErrorMsg(error);
        console.error('Erro ao converter HTML para PDF:', error);
      }
    );
  }

  geradorPDFFormularioCompleto() {
    this.templateHtmlService
      .geradorPDFFormularioCompleto(this.idForm)
      .subscribe(
        (pdf: Blob) => {
          this.pdfViewer.pdfSrc = pdf;
          this.pdfViewer.refresh();
        },
        (error: any) => {
          error.error.detail = 'Erro ao converter HTML para PDF';
          this.alertUtils.toastrErrorMsg(error);
          console.error('Erro ao converter HTML para PDF:', error);
        }
      );
  }

  geradorPDFEtp() {
    this.templateHtmlService
      .geradorPDFEtp(this.idForm, this.usarSigilo)
      .subscribe(
        (pdf: Blob) => {
          this.pdfViewer.pdfSrc = pdf;
          this.pdfViewer.refresh();
        },
        (error: any) => {
          error.error.detail = 'Erro ao converter HTML para PDF';
          this.alertUtils.toastrErrorMsg(error);
          console.error('Erro ao converter HTML para PDF:', error);
        }
      );
  }

  geradorPDFEtpAnalise() {
    this.templateHtmlService
      .geradorPDFEtpAnalise(this.idForm, this.usarSigilo)
      .subscribe(
        (pdf: Blob) => {
          this.pdfViewer.pdfSrc = pdf;
          this.pdfViewer.refresh();
        },
        (error: any) => {
          error.error.detail = 'Erro ao converter HTML para PDF';
          this.alertUtils.toastrErrorMsg(error);
          console.error('Erro ao converter HTML para PDF:', error);
        }
      );
  }

  close() {
    this.fecharModal.emit();
  }
}
