import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { CompararHtmlservice } from 'src/app/services/comparar-html.service';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';

@Component({
  selector: 'app-comparar-html',
  templateUrl: './comparar-html.component.html',
  styleUrls: ['./comparar-html.component.scss'],
})
export class CompararHtmlComponent implements OnInit {
  @Input()
  idFormulario!: number;
  versaoInicialFormulario: any;
  versaoFinalFormulario: any;
  check1 = true;
  check2 = false;
  temComparacao = false;
  listaVersoesInicial: any[] = [];
  listaVersoesFinal: any[] = [];
  excluidos = 0;
  inseridos = 0;
  disabledSecondeList = true;
  disabledCompareButton = true;
  versaoSizeDiferenteDeUm = false;
  constructor(
    private compararHtmlservice: CompararHtmlservice,
    private gestaoFormularioService: GestaoFormularioService,
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
    this.gestaoFormularioService
      .getFormularioTodasVersoes(this.idFormulario)
      .subscribe((response: any) => {
        if (response) {
          this.listaVersoesInicial = response;
          this.listaVersoesFinal = response;

          this.listaVersoesInicial.sort((a, b) => b.versao - a.versao);
          this.listaVersoesFinal.sort((a, b) => b.versao - a.versao);

          this.listaVersoesInicial = this.listaVersoesInicial.map((item) => ({
            ...item,
            displayName: `${item.id} - ${item.descricao} - Versão: ${item.versao}`,
          }));

          this.listaVersoesFinal = this.listaVersoesFinal.map((item) => ({
            ...item,
            displayName: `${item.id} - ${item.descricao} - Versão: ${item.versao}`,
          }));

          this.versaoSizeDiferenteDeUm = this.listaVersoesInicial?.length > 1;
        }
      });
  }

  onCheckboxChange(checkedCheckbox: string) {
    if (checkedCheckbox === 'check1' && this.check1) {
      this.check2 = false; // Desmarca check2 se check1 está marcado
    } else if (checkedCheckbox === 'check2' && this.check2) {
      this.check1 = false; // Desmarca check1 se check2 está marcado
    }
  }

  habilitarListaFinal() {
    if (this.versaoInicialFormulario) {
      this.disabledSecondeList = false;
      this.listaVersoesFinal = this.listaVersoesInicial.filter(
        (v) => v.id > this.versaoInicialFormulario.id
      );
    }
  }

  habilitarBotaoComparar() {
    return this.versaoInicialFormulario &&
      this.versaoFinalFormulario &&
      this.listaVersoesFinal.length > 0
      ? false
      : true;
  }

  compararHtml() {
    if (this.versaoInicialFormulario && this.versaoFinalFormulario) {
      this.compararHtmlservice
        .compararVersaoHtmlFormulario(
          this.versaoInicialFormulario.id,
          this.versaoFinalFormulario.id,
          this.check1,
          this.check2
        )
        .subscribe((response) => {
          if (response?.html) {
            this.createHtml(response.html);
            this.excluidos = response.excluidos;
            this.inseridos = response.inseridos;
            this.temComparacao = true;
          } else {
            this.temComparacao = false;
          }
        });
    }
  }

  createHtml(html: string) {
    const targetElement = this.el.nativeElement.querySelector(
      '#compararHtmlFormulario'
    );
    targetElement.innerHTML = html;
    if (!html) {
      this.temComparacao = false;
    }
  }
}
