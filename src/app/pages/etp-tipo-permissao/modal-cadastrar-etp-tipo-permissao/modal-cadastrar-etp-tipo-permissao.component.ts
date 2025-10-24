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
  selector: 'app-modal-cadastrar-etp-tipo-permissao',
  templateUrl: './modal-cadastrar-etp-tipo-permissao.component.html',
  styleUrl: './modal-cadastrar-etp-tipo-permissao.component.scss',
})
export class ModalCadastrarEtpTipoPermissaoComponent {
  @ViewChild('modalCadastrarEtpTipoPermissaoComponent') private modalContent:
    | TemplateRef<ModalCadastrarEtpTipoPermissaoComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarEtpTipoPermissao = new EventEmitter();

  public gestaoEtpTipoPermissaoModalForm!: FormGroup;

  public titulo?: string;

  etpTipoPermissao: any;
  constructor(
    public modalService: NgbModal,
    public alertUtil: AlertUtils,
    private formBuilder: FormBuilder
  ) {}

  open(etpTipoPermissao: any): Promise<boolean> {
    this.etpTipoPermissao = etpTipoPermissao;
    this.gestaoEtpTipoPermissaoModalForm = this.formBuilder.group({
      descricao: [etpTipoPermissao?.descricao, [Validators.required]],
      chave: [etpTipoPermissao?.chave, [Validators.required]],
      indStRegistro: [etpTipoPermissao?.indStRegistro, [Validators.required]],
    });

    if (this.etpTipoPermissao?.id) {
      this.titulo = 'Alterar Etp Tipo Permissão';
    } else {
      this.titulo = 'Cadastrar Etp Tipo Permissão';
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
    const objEtpTipoPermissao = {
      id: this.etpTipoPermissao?.id,
      descricao: this.formControl['descricao']?.value,
      chave: this.formControl['chave']?.value,
      indStRegistro: this.formControl['indStRegistro']?.value,
    };
    this.cadastrarEtpTipoPermissao.emit(objEtpTipoPermissao);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoEtpTipoPermissaoModalForm.controls;
  }
}
