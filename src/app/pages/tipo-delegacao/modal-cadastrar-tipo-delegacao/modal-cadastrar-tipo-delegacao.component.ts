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
  selector: 'app-modal-cadastrar-tipo-delegacao',
  templateUrl: './modal-cadastrar-tipo-delegacao.component.html',
  styleUrl: './modal-cadastrar-tipo-delegacao.component.scss',
})
export class ModalCadastrarTipoDelegacaoComponent {
  @ViewChild('modalCadastrarTipoDelegacaoComponent') private modalContent:
    | TemplateRef<ModalCadastrarTipoDelegacaoComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarTipoDelegacao = new EventEmitter();

  public gestaoTipoDelegacaoModalForm!: FormGroup;

  public titulo?: string;

  tipoDelegacao: any;
  constructor(
    public modalService: NgbModal,
    public alertUtil: AlertUtils,
    private formBuilder: FormBuilder
  ) {}

  open(tipoDelegacao: any): Promise<boolean> {
    this.tipoDelegacao = tipoDelegacao;
    this.gestaoTipoDelegacaoModalForm = this.formBuilder.group({
      descricao: [tipoDelegacao?.descricao, [Validators.required]],
      chave: [tipoDelegacao?.chave, [Validators.required]],
    });

    if (this.tipoDelegacao?.id) {
      this.titulo = 'Alterar Tipos de Delegação';
    } else {
      this.titulo = 'Cadastrar Tipos de Delegação';
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
    const objTipoDelegacao = {
      id: this.tipoDelegacao?.id,
      descricao: this.formControl['descricao']?.value,
      chave: this.formControl['chave']?.value,
    };
    this.cadastrarTipoDelegacao.emit(objTipoDelegacao);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoTipoDelegacaoModalForm.controls;
  }
}
