import {
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'etp-prazo',
  templateUrl: './etp-prazo.component.html',
  styleUrl: './etp-prazo.component.scss',
})
export class EtpPrazoComponent {
  @ViewChild('etpPrazo', { static: true }) private modalContent:
    | TemplateRef<EtpPrazoComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @Output() enviarPrazo = new EventEmitter();
  public prazoForm!: FormGroup;

  public titulo?: string = 'Incluir Prazo';
  etapasList: any[] = [];
  prioridadesList: any[] = [];
  unidadeId!: any;
  etpPrazo: any;
  botaoInativar = false;

  statusList: any[] = [
    { id: 'A', descricao: 'Ativo' },
    { id: 'I', descricao: 'Inativo' },
  ];

  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  open(prazo: any, etapaList: any, prioridadeList: any) {
    this.etpPrazo = prazo;
    if (this.etpPrazo?.id) {
      this.titulo = 'Alterar Prazo';
    } else {
      this.titulo = 'Incluir Prazo';
    }

    this.etapasList = etapaList;

    const etapa = this.etapasList.filter((u) => u.id === prazo?.idEtapa)[0];

    this.prioridadesList = prioridadeList;

    const prioridade = this.prioridadesList.filter(
      (u) => u.id === prazo?.idPrioridade
    )[0];

    this.prazoForm = this.formBuilder.group({
      motivacaoPrazo: [prazo?.motivacaoPrazo, [Validators.required]],
      qtdDiasLimiteRevisor: [
        prazo?.qtdDiasLimiteRevisor,
        [Validators.required],
      ],
      qtdDiasLimiteAnalista: [
        prazo?.qtdDiasLimiteAnalista,
        [Validators.required],
      ],
      etapaId: [etapa?.id, [Validators.required]],
      prioridadeId: [prioridade?.id, [Validators.required]],
      indStRegistro: [prazo?.indStRegistro, [Validators.required]],
    });

    if (this.prazoForm.controls['indStRegistro'].value === 'I') {
        this.botaoInativar = true;
      } else {
        this.botaoInativar = false;
      }

    if (!this.prazoForm.controls['indStRegistro'].value) {

      this.prazoForm.controls['indStRegistro'].setValue('A');
    }
    this.prazoForm.get('indStRegistro')?.disable();

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        fullscreen: false,
        windowClass: 'modal-largura-servidores',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  enviarPrazoSelecionado() {
    const analistaSelecionado = {
      motivacaoPrazo: this.formControl['motivacaoPrazo'].value,
      prazoId: this.etpPrazo?.id,
      prioridade: this.formControl['prioridadeId'].value,
      etapa: this.formControl['etapaId'].value,
      qtdDiasLimiteAnalista: this.formControl['qtdDiasLimiteAnalista'].value,
      qtdDiasLimiteRevisor: this.formControl['qtdDiasLimiteRevisor'].value,
      indStRegistro: this.formControl['indStRegistro'].value,
    };

    this.enviarPrazo.emit(analistaSelecionado);
    this.close();
  }

  get formControl() {
    return this.prazoForm.controls;
  }

  close() {
    if (this.modalRef) {
      this.prazoForm.reset();
      this.modalRef.close();
    }
  }

  ativarInativarPrazo(value: string) {
    this.prazoForm.controls['indStRegistro'].setValue(value);
    this.enviarPrazoSelecionado();
  }
}
