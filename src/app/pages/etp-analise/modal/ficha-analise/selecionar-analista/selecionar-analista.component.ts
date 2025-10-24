import {
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertUtils } from '../../../../../../utils/alerts.util';
import { Sarhclientservice } from '../../../../../services/sarhclient.service';
@Component({
  selector: 'selecionar-analista',
  templateUrl: './selecionar-analista.component.html',
  styleUrl: './selecionar-analista.component.scss',
})
export class SelecionarAnalistaComponent {
  @ViewChild('selecionarAnalista', { static: true }) private modalContent:
    | TemplateRef<SelecionarAnalistaComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @Output() enviarAnalistaSlecionado = new EventEmitter();

  public selecionarAnalistaForm!: FormGroup;
  analistaSelecionado: any;
  analistListFilter: any[] = [];
  tipoPermissaoList: any[] = [];
  tipoPermissao: any;
  dataInicial: any;
  dataFinal: any;
  unidadeFichaAnalise: any;

  // Está fixo abaixo.
  qtdDiasLimiteAnalista = 15;
  qtdDiasLimiteRevisor = 5;

  public titulo?: string = 'Selecionar Analista';
  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    private alertUtils: AlertUtils,
    private sarhclientservice: Sarhclientservice
  ) {}

  open(unidadeFichaAnalise: any, analistasList: any[], permissaoList: any[]) {
    this.tipoPermissaoList = permissaoList;
    this.tipoPermissao = this.tipoPermissaoList.filter(
      (p) => p.chave === 'RESPONSAVEL'
    );
    this.setaDatasAnalista(null, 'RESPONSAVEL');
    this.analistaSelecionado = null;
    this.unidadeFichaAnalise = unidadeFichaAnalise;
    this.selecionarAnalistaForm = this.formBuilder.group({
      tipoPermissao: [
        { value: this.tipoPermissao[0].chave, disabled: false },
        [Validators.required],
      ],
      dataInicial: [
        { value: this.dataInicial, disabled: true },
        [Validators.required],
      ],
      dataFinal: [
        { value: this.dataFinal, disabled: true },
        [Validators.required],
      ],
    });

    this.selecionarAnalistaForm
      .get('tipoPermissao')
      ?.valueChanges.subscribe((valorSelecionado) => {
        this.setaDatasAnalista(this.selecionarAnalistaForm, valorSelecionado);
      });

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

  public buscarAnalistaPorNome(event: any) {
    const query = event.query;
    this.sarhclientservice
      .getServidoresPorNome(query)
      .subscribe((servidorList) => {
        servidorList = servidorList.filter(
          (s) => s.idUnidadeDelegado == this.unidadeFichaAnalise
        );
        this.analistListFilter = servidorList;
      });
  }

  onAnalistaSlecionado(analista: any) {
    this.analistaSelecionado = analista.value;
  }

  clearAnalistaSlecionado() {
    this.analistaSelecionado = null;
  }

  enviarAnalistaSelecionado() {
    let idPermissao = this.formControl['tipoPermissao'].value;
    const tipoPermissao = this.tipoPermissaoList.filter(
      (p) => p.chave === idPermissao
    );

    const analistaSelecionado = {
      analista: this.analistaSelecionado,
      tipoPermissao: tipoPermissao[0].chave,
      permissao: tipoPermissao[0].descricao,
      dataInicial: this.formControl['dataInicial'].value,
      dataFinal: this.formControl['dataFinal'].value,
    };

    this.enviarAnalistaSlecionado.emit(analistaSelecionado);

    this.close();
  }

  get formControl() {
    return this.selecionarAnalistaForm.controls;
  }

  close() {
    if (this.modalRef) {
      this.selecionarAnalistaForm.reset();
      this.modalRef.close();
    }
  }

  public setaDatasAnalista(form: any, tipoPermissao: any) {
    this.dataInicial = this.adicionarDias(0, tipoPermissao);
    this.dataFinal = this.adicionarDias(
      this.qtdDiasLimiteRevisor,
      tipoPermissao
    );

    if (form) {
      form.get('dataInicial')?.setValue(this.dataInicial, { emitEvent: false });
      form.get('dataFinal')?.setValue(this.dataFinal, { emitEvent: false });
    }
  }

  adicionarDias(dias: number, tipoPermissao: string): string {
    let novaDataSelecionarAnalista = new Date();
    if (tipoPermissao === 'REVISOR') {
      novaDataSelecionarAnalista.setDate(novaDataSelecionarAnalista.getDate() + this.qtdDiasLimiteAnalista);
    } else {
      dias = dias != 0 ? this.qtdDiasLimiteAnalista : 0;
    }

    // está fixo abaixo.#fichaAnalise
    novaDataSelecionarAnalista.setDate(novaDataSelecionarAnalista.getDate() + dias);

    return (
      novaDataSelecionarAnalista.getFullYear() +
      '-' +
      String(novaDataSelecionarAnalista.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(novaDataSelecionarAnalista.getDate()).padStart(2, '0')
    );
  }

  converterDataSelecionarAnalista(dataSelecionarAnalista: Date): string {
    return (
      dataSelecionarAnalista.getFullYear() +
      '-' +
      String(dataSelecionarAnalista.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(dataSelecionarAnalista.getDate()).padStart(2, '0')
    );
  }

  adicionarTimeSelecionarAnalista(dataSelecionarAnalista: string, time: string): string | null {
    if (!dataSelecionarAnalista) return null;

    const novaDataSelecionarAnalista = new Date(dataSelecionarAnalista.replaceAll('/', '-') + 'T' + time);
    return (
      novaDataSelecionarAnalista.getFullYear() +
      '-' +
      String(novaDataSelecionarAnalista.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(novaDataSelecionarAnalista.getDate()).padStart(2, '0') +
      'T' +
      time
    );
  }
}
