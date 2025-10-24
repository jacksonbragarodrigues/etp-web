import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { CompararHtmlservice } from 'src/app/services/comparar-html.service';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';

@Component({
  selector: 'app-comparar-html-etp',
  templateUrl: './comparar-html-etp.component.html',
  styleUrl: './comparar-html-etp.component.scss',
})
export class CompararHtmlEtpComponent implements OnInit {
  @Input()
  idEtp!: number;
  versaoInicial: any;
  versaoFinal: any;
  check1 = true;
  check2 = false;
  temComparacao = false;
  listaVersoesInicialEtp: any[] = [];
  listaVersoesFinalEtp: any[] = [];
  excluidos = 0;
  inseridos = 0;
  disabledSecondeList = true;
  disabledCompareButton = true;
  versaoSizeDiferenteDeUm = false;
  constructor(
    private compararHtmlservice: CompararHtmlservice,
    private gestaoEtpService: GestaoEtpService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}
  ngOnInit(): void {
    this.popularListaDeVersoes();
  }

  getLabel(descricao: any, versao: any) {
    return descricao + versao;
  }

  popularListaDeVersoes() {
    this.gestaoEtpService
      .getEtpTodasVersoes(this.idEtp)
      .subscribe((response) => {
        if (response) {
          this.listaVersoesInicialEtp = response;
          this.listaVersoesFinalEtp = response;

          this.listaVersoesInicialEtp.sort((a, b) => b.versao - a.versao);
          this.listaVersoesFinalEtp.sort((a, b) => b.versao - a.versao);

          this.listaVersoesInicialEtp = this.listaVersoesInicialEtp.map(
            (item) => ({
              ...item,
              displayName: `${item.id} - ${item.descricao} - Versão: ${item.versao}`,
            })
          );

          this.listaVersoesFinalEtp = this.listaVersoesFinalEtp.map((item) => ({
            ...item,
            displayName: `${item.id} - ${item.descricao} - Versão: ${item.versao}`,
          }));

          this.versaoSizeDiferenteDeUm =
            this.listaVersoesInicialEtp?.length > 1;
        }
      });
  }

  onCheckboxChangeEtp(checkedCheckbox: string) {
    if (checkedCheckbox === 'check1' && this.check1) {
      this.check2 = false; // Desmarca check2 se check1 está marcado
    } else if (checkedCheckbox === 'check2' && this.check2) {
      this.check1 = false; // Desmarca check1 se check2 está marcado
    }
  }

  habilitarListaFinalEtp() {
    if (this.versaoInicial) {
      this.disabledSecondeList = false;
      this.listaVersoesFinalEtp = this.listaVersoesInicialEtp.filter(
        (v) => v.id > this.versaoInicial.id
      );
    }
  }

  habilitarBotaoCompararEtp() {
    return this.versaoInicial &&
      this.versaoFinal &&
      this.listaVersoesFinalEtp.length > 0
      ? false
      : true;
  }

  compararHtmlEtp() {
    if (this.versaoInicial && this.versaoFinal) {
      this.compararHtmlservice
        .compararVersaoHtmlEtp(
          this.versaoInicial.id,
          this.versaoFinal.id,
          this.check1,
          this.check2
        )
        .subscribe((response) => {
          if (response?.html) {
            this.createHtmlEtp(response.html);
            this.excluidos = response.excluidos;
            this.inseridos = response.inseridos;
            this.temComparacao = true;
          } else {
            this.temComparacao = false;
          }
        });
    }
  }

  createHtmlEtp(html: string) {
    const targetElement = this.el.nativeElement.querySelector('#compararHtml');
    targetElement.innerHTML = html;
    if (!html) {
      this.temComparacao = false;
    }
  }
}
