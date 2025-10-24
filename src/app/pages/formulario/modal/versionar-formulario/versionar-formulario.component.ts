import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-versionar-formulario',
  templateUrl: './versionar-formulario.component.html',
  styleUrl: './versionar-formulario.component.scss',
})
export class VersionarFormularioComponent {
  @ViewChild('versionarFormularioComponent', { static: true })
  private modalContent: TemplateRef<VersionarFormularioComponent> | undefined;
  modalRef!: NgbModalRef;

  public gestaoVersaoFormularioModalForm!: FormGroup;

  @Input() executaVersionarFormularioGestao!: Function;

  formulario: any;

  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  open(formulario: any): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static', // Não fechar ao clicar fora
        keyboard: false,
      });
      this.formulario = formulario;
      this.gestaoVersaoFormularioModalForm = this.formBuilder.group({
        descricao: [this.formulario?.motivo, [Validators.required]],
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  executaVersionarFormulario() {
    const descricao =
      this.gestaoVersaoFormularioModalForm.get('descricao')?.value;
    const formularioEnvio = { ...this.formulario, motivo: descricao };
    this.executaVersionarFormularioGestao(formularioEnvio);
    this.closeFormulario();
  }

  closeFormulario() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }
}
