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
  selector: 'app-modal-cadastrar-situacao',
  templateUrl: './modal-cadastrar-situacao.component.html',
  styleUrl: './modal-cadastrar-situacao.component.scss',
})
export class ModalCadastrarSituacaoComponent {
  @ViewChild('modalCadastrarSituacaoComponent') private modalContent:
    | TemplateRef<ModalCadastrarSituacaoComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarSituacao = new EventEmitter();

  public gestaoSituacaoModalForm!: FormGroup;

  public titulo?: string;

  Situacao: any;
  constructor(
    public modalService: NgbModal,
    public alertUtil: AlertUtils,
    private formBuilder: FormBuilder
  ) {}

  open(Situacao: any): Promise<boolean> {
    this.Situacao = Situacao;
    this.gestaoSituacaoModalForm = this.formBuilder.group({
      descricao: [Situacao?.descricao, [Validators.required]],
      chave: [Situacao?.chave, [Validators.required]],
    });

    if (this.Situacao?.id) {
      this.titulo = 'Alterar Situacao';
    } else {
      this.titulo = 'Cadastrar Situacao';
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
    const objSituacao = {
      id: this.Situacao?.id,
      descricao: this.formControl['descricao']?.value,
      chave: this.formControl['chave']?.value,
    };
    this.cadastrarSituacao.emit(objSituacao);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoSituacaoModalForm.controls;
  }
}
