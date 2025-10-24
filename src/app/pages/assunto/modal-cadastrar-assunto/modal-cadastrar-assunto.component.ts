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
  selector: 'app-modal-cadastrar-assunto',
  templateUrl: './modal-cadastrar-assunto.component.html',
  styleUrl: './modal-cadastrar-assunto.component.scss',
})
export class ModalCadastrarAssuntoComponent {
  @ViewChild('modalCadastrarAssuntoComponent') private modalContent:
    | TemplateRef<ModalCadastrarAssuntoComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarAssunto = new EventEmitter();

  public gestaoAssuntoModalForm!: FormGroup;

  public titulo?: string;

  formularioList: any[] = [];

  assunto: any;
  constructor(
    public modalService: NgbModal,
    public alertUtil: AlertUtils,
    private formBuilder: FormBuilder
  ) {}

  open(assunto: any, formularioList: any[]): Promise<boolean> {
    this.assunto = assunto;
    this.formularioList = formularioList;
    this.gestaoAssuntoModalForm = this.formBuilder.group({
      descricao: [assunto?.descricao, [Validators.required]],
      chave: [assunto?.chave, [Validators.required]],
      sqFormularioAnalise: [
        assunto?.sqFormularioAnalise,
        [Validators.required],
      ],
    });

    if (this.assunto?.id) {
      this.titulo = 'Alterar Assunto';
    } else {
      this.titulo = 'Cadastrar Assunto';
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
    const objAssunto = {
      id: this.assunto?.id,
      descricao: this.formControl['descricao']?.value,
      chave: this.formControl['chave']?.value,
      sqFormularioAnalise: this.formControl['sqFormularioAnalise']?.value,
    };
    this.cadastrarAssunto.emit(objAssunto);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoAssuntoModalForm.controls;
  }
}
