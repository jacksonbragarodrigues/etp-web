import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {EtpNumeracaoService} from "../../../services/etp-numeracao.service";

@Component({
  selector: 'modal-cadastrar-etp-numeracao',
  templateUrl: './modal-cadastrar-etp-numeracao.component.html',
  styleUrl: './modal-cadastrar-etp-numeracao.component.scss'
})
export class ModalCadastrarEtpNumeracaoComponent {
  @ViewChild('modalCadastraEtpNumeracaoComponent') private modalContent:
    | TemplateRef<ModalCadastrarEtpNumeracaoComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarEtpNumeracao = new EventEmitter();

  public gestaoEtpNumercaoModalForm!: FormGroup;

  public titulo?: string;

  etpNumeracao: any;
  etpList: any;
  statusList:any;
  anoAlterado: boolean = false;
  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    private etpNumeracaoService: EtpNumeracaoService
  ) {}

  open(etpNumeracao: any,
       etpList: any,
       statusList: any): Promise<boolean> {

    this.etpNumeracao = etpNumeracao;
    this.etpList = etpList;
    this.statusList = statusList;
    if(!etpNumeracao){
      etpNumeracao = {};
      etpNumeracao.status = statusList.find((s: any) => s.nome === 'ATIVO').id;
    }


    this.gestaoEtpNumercaoModalForm = this.formBuilder.group({
      ano: [etpNumeracao?.ano, [Validators.required]],
      etp: [etpNumeracao?.etp, [Validators.required]],
      etpNumeracao: [etpNumeracao?.etpNumeracao, [Validators.required]],
      status: [etpNumeracao?.status, [Validators.required]],
    });

    if (this.etpNumeracao?.idNumeracaoEtp) {
      this.titulo = 'Alterar Numeração';
    } else {
      this.titulo = 'Cadastrar Numeração';
      this.gestaoEtpNumercaoModalForm?.get('status')?.disable();
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
    const objEtpNumeracao = {
      idNumeracaoEtp: this.etpNumeracao?.idNumeracaoEtp,
      ano: this.formControl['ano']?.value,
      etp: this.formControl['etp']?.value,
      etpNumeracao: this.formControl['etpNumeracao']?.value,
      status: this.formControl['status']?.value
    };
    this.cadastrarEtpNumeracao.emit(objEtpNumeracao);
  }

  close() {
    if (this.modalRef) {
      this.etpNumeracao = null;
      this.statusList = [];
      this.etpList = [];
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoEtpNumercaoModalForm.controls;
  }



  recuperarNumeroEtp() {
    if (this.formControl['ano']?.value &&
        String(this.formControl['ano']?.value).length === 4) {
      this.etpNumeracaoService
        .getUltimoNumeroEtpPorAno(Number(this.formControl['ano']?.value))
        .subscribe({
          next: (data: any) => {
            this.formControl['etpNumeracao']?.setValue(String(data));
            this.anoAlterado = true;
          }
        });
    }
  }

  setCurrentYear() {
    if(!this.formControl['ano']?.value) {
      const currentYear = new Date().getFullYear();
      this.formControl['ano']?.setValue(String(currentYear));
    }
  }
}
