import {
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AssuntoFormularioServiceService } from 'src/app/services/assunto-formulario-service.service';
import { AlertUtils } from 'src/utils/alerts.util';

@Component({
  selector: 'modal-cadastrar-formulario',
  templateUrl: './modal-cadastrar-formulario.component.html',
  styleUrls: ['./modal-cadastrar-formulario.component.scss'],
})
export class ModalCadastrarFormularioComponent {
  @ViewChild('modalCadastrarFormularioComponent') private modalContent:
    | TemplateRef<ModalCadastrarFormularioComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Output() cadastrarFormulario = new EventEmitter();

  public gestaoFormularioModalForm!: FormGroup;
  public titulo?: string;

  situacaoList: any[] = [];
  assuntoList: any[] = [];
  formulario: any;
  setarPadrao: boolean = false;
  mensagens = {
    MSG_JSON_PADRAO_SALVO: 'Formulário padrão salvo com sucesso',
    MSG_SUCESSO_ALTERAR: 'Alterado com sucesso',
  };

  constructor(
    public modalService: NgbModal,
    public formBuilder: FormBuilder,
    public alertUtils: AlertUtils,
    public assuntoFormularioServiceService: AssuntoFormularioServiceService
  ) {}

  open(
    formulario: any,
    assuntoList: any[],
    situacaoList: any[]
  ): Promise<boolean> {
    this.situacaoList = situacaoList;
    this.assuntoList = assuntoList;
    if (!formulario) {
      formulario = {};
      formulario.situacao = situacaoList.find((s) => s.chave === 'ABERTO');
    }
    this.formulario = formulario;
    this.setarPadrao = formulario.setarPadrao;
    this.gestaoFormularioModalForm = this.formBuilder.group({
      assuntoId: [formulario?.assunto?.id, [Validators.required]],
      situacaoId: [formulario?.situacao?.id, [Validators.required]],
      descricao: [formulario?.descricao, [Validators.required]],
      jsonForm: formulario?.jsonForm,
      idPai: formulario?.idPai,
      versao: formulario?.versao,
    });

    if (this.formulario?.id) {
      this.titulo = 'Alterar Formulário';
    } else {
      this.titulo = 'Cadastrar Formulário';
    }
    this.gestaoFormularioModalForm?.get('situacaoId')?.disable();
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  salvarAssuntoJsonPadrao() {
    this.assuntoFormularioServiceService
      .putAssuntoJsonPadrao(this.formulario?.assunto?.id, {
        jsonPadrao: this.formulario?.jsonForm,
      })
      .subscribe({
        next: () => {
          this.alertUtils.handleSucess(this.mensagens.MSG_JSON_PADRAO_SALVO);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
        },
      });
  }

  habilitaSituacao() {
    return this.formulario?.id ? true : false;
  }

  gravar() {
    const objFormulario = {
      id: this.formulario?.id,
      assunto: {
        id: this.formControl['assuntoId']?.value,
        descricao: null,
      },
      situacao: {
        id: this.formControl['situacaoId']?.value,
        descricao: null,
      },
      descricao: this.formControl['descricao']?.value,
      jsonForm: this.formControl['jsonForm']?.value,
      idPai: this.formControl['idPai']?.value,
      versao:
        this.formulario?.versao === undefined
          ? 1
          : this.formControl['versao']?.value,
    };
    this.cadastrarFormulario.emit(objFormulario);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoFormularioModalForm.controls;
  }
}
