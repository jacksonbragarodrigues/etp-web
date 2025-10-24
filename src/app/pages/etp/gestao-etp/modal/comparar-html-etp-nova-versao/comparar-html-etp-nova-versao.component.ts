import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CompararHtmlservice } from 'src/app/services/comparar-html.service';

@Component({
  selector: 'app-comparar-html-etp-nova-versao',
  templateUrl: './comparar-html-etp-nova-versao.component.html',
  styleUrl: './comparar-html-etp-nova-versao.component.scss',
})
export class CompararHtmlEtpNovaVersaoComponent  {
  @ViewChild('htmlNovaVersao') private modalContent:
    | TemplateRef<CompararHtmlEtpNovaVersaoComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @ViewChild('compararHtmlNovo', { static: false })
  compararHtmlNovo!: ElementRef;
  @Input()
  cancelarNovaVersao?: Function;
  @Input()
  aceitarNovaVersao?: Function;
  versaoInicial: any;
  versaoFinal: any;
  temComparacao = false;
  check1 = true;
  check2 = false;
  etp: any;
  formulario: any;
  constructor(
    private compararHtmlservice: CompararHtmlservice,
    private el: ElementRef,
    public modalService: NgbModal,
    private renderer: Renderer2
  ) {}

  cancelarNovaVersaoHtml() {
    if (this.cancelarNovaVersao) {
      this.cancelarNovaVersao(this.etp);
      this.close();
    }
  }

  aceitarNovaVersaoHtml() {
    if (this.aceitarNovaVersao) {
      this.aceitarNovaVersao(this.etp, this.formulario);
      this.close();
    }
  }

  public open(
    versaoInicial: any,
    versaoFinal: any,
    etp: any,
    formulario: any
  ): Promise<boolean> {
    this.versaoInicial = versaoInicial;
    this.versaoFinal = versaoFinal;
    this.etp = etp;
    this.formulario = formulario;
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        fullscreen: false,
        windowClass: 'modal-largura-customizada-html',
      });

      this.modalRef.result.then((result) => {
        resolve(result);
      });

      // Aguardar o modal ser renderizado antes de chamar compararHtml
      setTimeout(() => {
        this.compararHtml();
      }, 100);
    });
  }

  getLabel(descricao: any, versao: any) {
    return descricao + versao;
  }

  compararHtml() {
    if (this.versaoInicial && this.versaoFinal) {
      this.compararHtmlservice
        .compararVersaoHtmlFormulario(
          this.versaoInicial,
          this.versaoFinal,
          this.check1,
          this.check2
        )
        .subscribe((response) => {
          if (response?.html) {
            this.createHtml(response.html);
            this.temComparacao = true;
          } else {
            this.temComparacao = false;
          }
        });
    }
  }

  createHtml(html: string) {
    setTimeout(() => {
      const targetElement = document.querySelector('[id="compararHtmlNovo"]');
      if (targetElement) {
        console.log('Elemento encontrado via querySelector:', targetElement);
        targetElement.innerHTML = html;
      } else {
        console.warn('Elemento #compararHtmlNovo ainda não está no DOM.');
      }
    }, 100);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
