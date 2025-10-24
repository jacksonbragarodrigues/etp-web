import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-versionar',
  templateUrl: './versionar.component.html',
  styleUrl: './versionar.component.scss',
})
export class VersionarComponent {
  @ViewChild('versionarComponent', { static: true }) private modalContent:
    | TemplateRef<VersionarComponent>
    | undefined;
  modalRef!: NgbModalRef;

  public gestaoVersaoModalForm!: FormGroup;

  @Input() executaVersionarGestao!: Function;

  etp: any;

  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  open(etp: any): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static', // Não fechar ao clicar fora
        keyboard: false,
      });
      this.etp = etp;
      this.gestaoVersaoModalForm = this.formBuilder.group({
        descricao: [this.etp?.motivo, [Validators.required]],
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  executaVersionar() {
    const descricao = this.gestaoVersaoModalForm.get('descricao')?.value;
    const etpEnvio = { ...this.etp, motivo: descricao };
    this.executaVersionarGestao(etpEnvio);
    this.close();
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }
}
