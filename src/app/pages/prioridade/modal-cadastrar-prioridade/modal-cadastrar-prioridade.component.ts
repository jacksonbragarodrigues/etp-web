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
  selector: 'app-modal-cadastrar-prioridade',
  templateUrl: './modal-cadastrar-prioridade.component.html',
  styleUrl: './modal-cadastrar-prioridade.component.scss',
})
export class ModalCadastrarPrioridadeComponent {
  @ViewChild('modalCadastrarPrioridadeComponent') private modalContent:
    | TemplateRef<ModalCadastrarPrioridadeComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarPrioridade = new EventEmitter();

  public gestaoPrioridadeModalForm!: FormGroup;

  public titulo?: string;

  prioridade: any;

  padraoList: any[] = [
    { id: 0, descricao: 'Não' },
    { id: 1, descricao: 'Sim' },
  ];

  constructor(
    public modalService: NgbModal,
    public alertUtil: AlertUtils,
    private formBuilder: FormBuilder
  ) {}

  open(Prioridade: any): Promise<boolean> {
    this.prioridade = Prioridade;
    this.gestaoPrioridadeModalForm = this.formBuilder.group({
      descricao: [Prioridade?.descricao, [Validators.required]],
      chave: [Prioridade?.chave, [Validators.required]],
      padrao: [Prioridade?.padrao, [Validators.required]],
    });

    if (this.prioridade?.id) {
      this.titulo = 'Alterar Prioridade';
    } else {
      this.titulo = 'Cadastrar Prioridade';
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
    const objPrioridade = {
      id: this.prioridade?.id,
      descricao: this.formControl['descricao']?.value,
      chave: this.formControl['chave']?.value,
      padrao: this.formControl['padrao']?.value,
    };
    this.cadastrarPrioridade.emit(objPrioridade);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoPrioridadeModalForm.controls;
  }
}
