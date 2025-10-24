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
  selector: 'app-modal-cadastrar-etp-etapa',
  templateUrl: './modal-cadastrar-etp-etapa.component.html',
  styleUrl: './modal-cadastrar-etp-etapa.component.scss',
})
export class ModalCadastrarEtpEtapaComponent {
  @ViewChild('modalCadastrarEtapaComponent') private modalContent:
    | TemplateRef<ModalCadastrarEtpEtapaComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarEtpEtapa = new EventEmitter();

  public gestaoEtapaModalForm!: FormGroup;

  public titulo?: string;

  etapa: any;
  constructor(
    public modalService: NgbModal,
    public alertUtil: AlertUtils,
    private formBuilder: FormBuilder
  ) {}

  open(etapa: any): Promise<boolean> {
    this.etapa = etapa;
    this.gestaoEtapaModalForm = this.formBuilder.group({
      descricao: [etapa?.descricao, [Validators.required]],
      chave: [etapa?.chave, [Validators.required]],
    });

    if (this.etapa?.id) {
      this.titulo = 'Alterar Etapa';
    } else {
      this.titulo = 'Cadastrar Etapa';
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
    const objEtapa = {
      id: this.etapa?.id,
      descricao: this.formControl['descricao']?.value,
      chave: this.formControl['chave']?.value,
    };
    this.cadastrarEtpEtapa.emit(objEtapa);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoEtapaModalForm.controls;
  }
}
