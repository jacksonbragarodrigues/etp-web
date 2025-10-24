import {
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertUtils } from 'src/utils/alerts.util';

@Component({
  selector: 'app-modal-cadastrar-rotulos',
  templateUrl: './modal-cadastrar-rotulos.component.html',
  styleUrl: './modal-cadastrar-rotulos.component.scss',
})
export class ModalCadastrarRotulosComponent {
  @ViewChild('modalCadastrarRotulosComponent') private modalContent:
    | TemplateRef<ModalCadastrarRotulosComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarRotulos = new EventEmitter();

  public gestaoRotulosModalForm!: FormGroup;

  public titulo?: string;

  rotulos: any;
  constructor(
    public modalService: NgbModal,
    public alertUtil: AlertUtils,
    private formBuilder: FormBuilder
  ) {}

  open(rotulos: any): Promise<boolean> {
    this.rotulos = rotulos;
    this.gestaoRotulosModalForm = this.formBuilder.group({
      de: [rotulos?.de, [Validators.required]],
      para: [rotulos?.para, [Validators.required]],
    });

    if (this.rotulos?.id) {
      this.titulo = 'Alterar Rótulo';
    } else {
      this.titulo = 'Cadastrar Rótulo';
    }

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  gravar() {
    const objRotulos = {
      id: this.rotulos?.id,
      de: this.formControl['de']?.value,
      para: this.formControl['para']?.value,
    };
    this.cadastrarRotulos.emit(objRotulos);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoRotulosModalForm.controls;
  }
}
